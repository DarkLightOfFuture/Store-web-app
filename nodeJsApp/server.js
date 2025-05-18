'use strict';
import { Users, Products, Reviews, Purchases, HexToUUID } from "./models/DbModel.js"

import * as path from 'path';
import express from 'express';
import * as mysql from 'mysql2/promise';
import * as uuid from "uuid";
import * as bcrypt from "bcrypt";
import passport from "passport";
import flash from "express-flash";
import session from "express-session";
import methodOverride from 'method-override'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as fs from "fs";
import multer from "multer"
import cookieParser from "cookie-parser"
import * as initPassport from "./passport-conf.js";


import dotenv from 'dotenv';
dotenv.config();

export { uuid, db }

//Displays app logs
function appLog(message) {
    const fDate = (numb) => {
        return numb.toString().padStart("2", "0");
    };

    const crrDate = new Date();
    const date = fDate(crrDate.getDate()) + "/" +
        fDate(parseInt(crrDate.getMonth() + 1))
        + "/" + fDate(crrDate.getFullYear()) + " "
        + fDate(crrDate.getHours()) + ":"
        + fDate(crrDate.getMinutes()) + ":"
        + fDate(crrDate.getSeconds());

    console.log(`${date} // ${message}`);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var app = express();

//JSON responses use of
app.use(express.json());

//Passport js initialization
initPassport.Initialize(passport);
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
}));
app.use(passport.session());
app.use(passport.initialize());

app.use(methodOverride("_method"));
//Cookie use of
app.use(cookieParser());

var staticPath = path.join(__dirname, '/');
app.use(express.static(staticPath));

app.set('port', process.env.PORT || 3000);

//Connection conf
const conn = {
    "host": "localhost",
    "user": "example",
    "password": "password123",
    "database": "db"
}

let db = await mysql.createConnection(conn);

var server = app.listen(app.get('port'), async function () {
    appLog("Listening.");

    //Database initialization
    try {
        await db.query("CREATE DATABASE db");

        db = await mysql.createConnection(conn);

        await db.query(
            `CREATE TABLE Users (
                    Id BINARY(16) NOT NULL PRIMARY KEY,
                    Username VARCHAR(25) NOT NULL UNIQUE,
                    FirstName VARCHAR(25) NOT NULL,
                    LastName VARCHAR(25) NOT NULL,
                    Email VARCHAR(30) NOT NULL UNIQUE,
                    Town VARCHAR(50) NOT NULL,
                    Street VARCHAR(50) NOT NULL,
                    PostalCode VARCHAR(10) NOT NULL,
                    Phone VARCHAR(12) NOT NULL,
                    IsAdmin BOOL NOT NULL DEFAULT False,
                    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    Type ENUM('Company', "Customer") NOT NULL,
                    Avatar VARCHAR(150)
                )`
        );

        await db.query(
            `CREATE TABLE UserPasswords (
                    UserId BINARY(16) NOT NULL PRIMARY KEY,
                    PasswordHash VARCHAR(60) NOT NULL,
                    FOREIGN KEY (UserId) REFERENCES Users(Id)
                        ON DELETE CASCADE
            )`
        );

        await db.query(
            `CREATE TABLE Products (
                    Id BINARY(16) NOT NULL PRIMARY KEY,
                    Title VARCHAR(100) NOT NULL,
                    Description TEXT(5000) DEFAULT NULL,
                    RawDescription TEXT(5000) DEFAULT NULL,
                    Price DECIMAL(10,2) UNSIGNED NOT NULL,
                    ImgPaths JSON,
                    Cond ENUM('brand new', 'damaged', 'used') NOT NULL,
                    Amount INT UNSIGNED NOT NULL,
                    Category ENUM('House','Clothes','Games','Automotive','Electronics','Health') NOT NULL,
                    TotalRatings DOUBLE(32,4) UNSIGNED DEFAULT 0,
                    RatingCount MEDIUMINT UNSIGNED DEFAULT 0,
                    Rating DOUBLE(7,4) UNSIGNED DEFAULT 0.0,
                    Bought INT UNSIGNED DEFAULT 0,
                    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UserId BINARY(16) NOT NULL,
                    FOREIGN KEY (UserId) REFERENCES Users(Id)
                        ON DELETE CASCADE
            )`
        );

        await db.query(
            `CREATE TABLE Reviews (
                Id INT AUTO_INCREMENT PRIMARY KEY,
                Value DOUBLE(3, 1) NOT NULL,
                Comment TEXT(2000) DEFAULT NULL,
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UserId BINARY(16) NOT NULL,
                ProductId BINARY(16) NOT NULL,
                FOREIGN KEY (ProductId) REFERENCES Products(Id)
                    ON DELETE CASCADE,
                FOREIGN KEY (UserId) REFERENCES Users(Id)
            )`
        )

        await db.query(
            `CREATE TABLE Purchases (
                Id BINARY(16) NOT NULL PRIMARY KEY,
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                DeliveryDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                DeliveryType ENUM('Courier (cash)', 'Courier (electronic prepayment)', 'Courier (electronic payment on delivery)', 'In-store pickup') NOT NULL,
                UserId BINARY(16) NULL,
                FirstName VARCHAR(25) NULL,
                LastName VARCHAR(25) NULL,
                Email VARCHAR(30) NULL,
                Town VARCHAR(50) NULL,
                Street VARCHAR(50) NULL,
                PostalCode VARCHAR(10) NULL,
                Phone VARCHAR(12) NULL,
                FOREIGN KEY (UserId) REFERENCES Users(Id)
            )`
        );

        await db.query(
            `CREATE TABLE PurchaseProducts (
                Id BINARY(16) NOT NULL,
                Amount INT UNSIGNED NOT NULL,
                PurchaseId BINARY(16) NOT NULL,
                FOREIGN KEY (PurchaseId) REFERENCES Purchases(Id)
                    ON DELETE CASCADE,
                FOREIGN KEY (Id) REFERENCES Products(Id)
            )`
        );

        //Review's triggers

        await db.query(
            `CREATE TRIGGER AfterReviewInsert
            AFTER INSERT ON Reviews FOR EACH ROW
            BEGIN
                DECLARE newRatingCount INT;
                DECLARE newTotalRatings INT;
    
                -- Sets variables
                SELECT 
                    RatingCount + 1,
                    TotalRatings + NEW.Value
                INTO 
                    newRatingCount,
                    newTotalRatings
                FROM Products 
                WHERE Id = NEW.ProductId;
    
                -- Updates product
                UPDATE Products SET
                    RatingCount = newRatingCount,
                    TotalRatings = newTotalRatings,
                    Rating = CASE 
                        WHEN newRatingCount = 0 THEN 0
                        ELSE newTotalRatings * 1.0 / newRatingCount  -- newTotalRating is treated as float
                    END
                WHERE Id = NEW.ProductId;
            END;`
        );

        //await db.query(
        //    `CREATE TRIGGER AfterReviewUpdate
        //    AFTER UPDATE ON Reviews FOR EACH ROW
        //    BEGIN
        //        UPDATE Products SET
        //        TotalRatings = TotalRatings - OLD.Value + NEW.Value,
        //        Rating = (TotalRatings - OLD.Value + NEW.Value) / RatingCount
        //        WHERE Products.Id = NEW.ProductId;
        //    END;`
        //);

        await db.query(
            `CREATE TRIGGER AfterReviewRemove
            AFTER DELETE ON Reviews FOR EACH ROW
            BEGIN
                DECLARE newRatingCount INT;
                DECLARE newTotalRatings INT;

                -- Sets variables
                SELECT
                    RatingCount - 1,
                    TotalRatings - OLD.Value
                INTO
                    newRatingCount,
                    newTotalRatings
                FROM Products
                WHERE Id = OLD.ProductId;

                -- Updates product
                UPDATE Products SET
                    RatingCount = newRatingCount,
                    TotalRatings = newTotalRatings,
                    Rating = CASE
                        WHEN newRatingCount = 0 THEN 0
                        ELSE newTotalRatings * 1.0 / newRatingCount  -- newTotalRating is treated as float
                    END
                WHERE Id = OLD.ProductId;
            END;`
        );

        //PurchaseProduct's triggers

        await db.query(
            `CREATE TRIGGER AfterPurchaseProductsInsert
            AFTER INSERT ON PurchaseProducts FOR EACH ROW
            BEGIN
                DECLARE currentAmount INT;
                DECLARE newAmount INT;

                -- Sets variable
                SELECT Amount INTO currentAmount
                FROM Products
                WHERE Id = NEW.Id;

                -- Prevents negative amount
                SET newAmount = GREATEST(currentAmount - NEW.Amount, 0);

                -- Updates product
                UPDATE Products SET
                    Bought = Bought + NEW.Amount,
                    Amount = newAmount
                WHERE Id = NEW.ProductId;
            END;`
        );

        await db.query(
            `CREATE TRIGGER AfterPurchaseProductsRemove
            AFTER DELETE ON PurchaseProducts FOR EACH ROW
            BEGIN
                DECLARE current_amount INT;

                -- Sets variable
                SELECT Amount INTO current_amount
                FROM Products
                WHERE Id = OLD.Id;

                -- Updates product
                UPDATE Products SET
                    -- Prevents negative Bought
                    Bought = GREATEST(Bought - OLD.Amount, 0),
                    Amount = current_amount
                WHERE Id = OLD.Id;
            END;`
        );

        appLog("Database successfully created.");
    }
    catch (err) {
        //Database was created before
        if (err?.toString().includes("exists"))
        {
            db = await mysql.createConnection(conn);

            return appLog("Database loaded properly.");
        }
        else
            appLog(err.message);
    }
});

//Total max size of files in request = 60 MB
const upload = multer({ limits: { fileSize: 60 * 1024 * 1024 } });

//Authentication

function IsAuthenticated(req, res, next) {
    if (!req.isAuthenticated())
        return res.status(401).send();
    
    next();
}

//Loads user's session if exists
app.get("/api/checkauth", (req, res) => {
    return res.status(200).json({ User: req.user != undefined? req.user : null });
});

app.post("/api/register", upload.array("Avatar", 1), async (req, res) => {
    let {
        Password1: pass1,
        Password2: pass2,
        Username: uname,
        FirstName: fName,
        LastName: lName,
        Email: email,
        Avatar: avatar,
        Type: type
    } = req.body || {};

    if (!pass1 || !pass2 || !uname || !fName || !lName || !email || pass1 != pass2)
        return res.status(400).json({ error: "Failed to register user. (Invalid data)" });

    try {
        const id = uuid.v4();
        const idVal = `UNHEX(REPLACE('${id}', '-', ''))`;

        //Uploads avatar on server
        req.files?.forEach(file => {
            const img = `${id}.jpg`
            const p = path.join(__dirname, "avatars", img);

            avatar = path.join("avatars", img).replaceAll("\\", "//");

            fs.writeFileSync(p, file.buffer);
        })

        //In comparison to ordinary user, company has avatar
        if (avatar != undefined)
            type = "Company";
        else {
            type = "Customer";
            avatar = null;
        }

        //Password hash creation
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(pass1, salt);

        //Inserts user into database
        await db.execute(`INSERT INTO Users (Id, Username, FirstName, LastName, Email, Avatar, Type)` +
            `VALUES (${idVal}, ?, ?, ?, ?, ?, ?)`, [uname, fName, lName, email, avatar, type]);

        //Inserts User's password hash into database
        await db.execute(`INSERT INTO UserPasswords (UserId, PasswordHash) VALUES (${idVal}, ?)`, [hash]);

        return res.json({ message: "User has been registered successfully.", error: null });
    }
    catch (error) {
        return res.status(400).json({ error: 'Failed to register user.' });
    }
});

app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (user == false)
            return res.status(400).json(info);

        req.login(user, (err) => {
            if (err)
                return res.status(500).json({ error: "Failed to make user's session." });

            if (req.body.RememberMe == true) {
                //14 days remember me session
                req.session.cookie.maxAge = 14 * 24 * 60 * 60 * 1000;
            }
            else {
                //Temporary session
                req.session.cookie.expires = false;
            }

            return res.status(200).json({ User: user });
        });
    })(req, res)
});

app.delete("/api/logout", (req, res) => {
    req.logout(err => {
        if (err)
            return res.status(400).send();

        res.status(200).send();
    });
});

//Products

app.post("/api/product/add", IsAuthenticated, upload.array("Images", 12), async (req, res) => {
    if (req.user.IsCompany) {
        //Paths to images in folder
        let paths = [];
        const id = uuid.v4();
        //Image's index in folder
        let ind = 0;
        
        const dir = path.join(__dirname, "images", id);

        //Create images' folder
        fs.mkdirSync(dir, { recursive: true });

        //Uploads product's images on server
        req.files?.forEach(file => {
            const fName = `${++ind}.jpg`;

            const p = path.join(dir, fName);
            paths.push(path.join("images", id, fName).replaceAll("\\", "//"));

            fs.writeFileSync(p, file.buffer,
                err => res.status(400).
                    json({ message: null, error: "Files haven't been uploaded successfully." }));
        });

        req.body.UserId = req.user.Id;
        req.body.Id = id;
        req.body.ImgPaths = JSON.stringify(paths);

        const r = await Products.Add(req.body);

        return r.error == null ?
            res.json({ message: "Product has been added successfully.", error: null }) :
            res.status(400).json({ message: null, error: r.error });
    }
    else
        return res.status(403).send();
});

app.post("/api/product/get", async (req, res) => {
    const r = await Products.FindById(req.body.id, req.body.columns, req.body.join);

    return r.error == null ?
        res.json(r) :
        res.status(400).json(r);
});

app.get("/api/product/getmany", async (req, res) => {
    const r = await Products.SelectMany(req.query);

    return r.error == null ?
        res.json(r) :
        res.status(400).json(r);
});

app.post("/api/product/update", IsAuthenticated, upload.array("Images", 12), async (req, res) => {
    const id = req.body["Id"];

    if (id != undefined) {
        const product = await Products.FindById(id, ["UserId"]);

        if (HexToUUID(product.response?.UserId) == req.user.Id) {
            let paths = [];

            //Prevents CrrPaths, DelPaths from being string or NULL

            if (req.body.CrrPaths == undefined)
                req.body.CrrPaths = [];
            else if (typeof req.body.CrrPaths == "string")
                req.body.CrrPaths = [req.body.CrrPaths]

            if (req.body.DelPaths == undefined)
                req.body.DelPaths = [];
            else if (typeof req.body.DelPaths == "string")
                req.body.DelPaths = [req.body.DelPaths];

            req.body.CrrPaths.forEach(el => paths.push(el));

            const indices = req.body.CrrPaths.concat(req.body.DelPaths).map(el => {
                const splited = el.split("//");

                return parseInt(splited[splited.length - 1].split(".")[0]);
            });

            //first available image's index in folder (autoincrement)
            let ind = Math.max(...indices);

            const dir = path.join(__dirname, "images", req.body["Id"]);

            //Deletes old images of product
            req.body.DelPaths.forEach(el => {
                const p = path.join(dir, el.split("//")[2]);

                fs.unlink(p, (err) => {
                    if (err)
                        console.log(`Cannot delete file: ${p}`);
                });
            });

            delete req.body.CrrPaths;
            delete req.body.DelPaths;

            //Adds new images of product
            req.files.forEach(file => {
                const fName = `${++ind}.jpg`;

                const p = path.join(dir, fName);
                paths.push(path.join("images", req.body["Id"], fName).replaceAll("\\", "//"));

                fs.writeFileSync(p, file.buffer,
                    err => res.status(400).
                        json({ message: null, error: "Files haven't been uploaded successfully." }));
            });

            req.body.ImgPaths = JSON.stringify(paths);

            const r = await Products.Update(req.body);

            return r.error == null ?
                res.json({ message: "Product has been updated successfully.", error: null }) :
                res.status(400).json({ message: null, error: r.error });
        }
        else
            return res.status(400).json({ message: null, error: "You haven't permission for this action" });
    }
    else
        return res.status(400).json({ message: null, error: "The id wasn't inserted." });
});

app.delete("/api/product/remove", IsAuthenticated, async (req, res) => {
    const id = req.query["Id"];

    if (id != undefined) {
        let product;

        if (!req.user.IsAdmin)
            product = await Products.FindById(id, ["UserId"]);

        if (req.user.IsAdmin || HexToUUID(product.response?.UserId) == req.user.Id) {
            const dir = path.join(__dirname, "images", id);

            //Deletes images of product
            fs.rm(dir, { recursive: true }, (err) => {
                if (err)
                    console.log(`Cannot delete directory: ${dir}`);
            });

            const r = await Products.Remove(id);

            return r.error == null ?
                res.json({ message: "Product has been removed successfully.", error: null }) :
                res.status(400).json({ message: null, error: r.error });
        }
        else
            return res.status(400).json({ message: null, error: "You haven't permission for this action" });
    }
    else
        return res.status(400).json({ message: null, error: "The id wasn't inserted." });
});

//Reviews

app.post("/api/review/add", IsAuthenticated, async (req, res) => {
    req.body.UserId = req.user.Id;

    const r = await Reviews.Add(req.body);

    return r.error == null ?
        res.json({ message: "Review has been added successfully.", error: null }) :
        res.status(400).json({ message: null, error: r.error });
});

app.delete("/api/review/remove", IsAuthenticated, async (req, res) => {
    const id = req.query["Id"];

    if (id != undefined) {
        let review;

        if (!req.user.IsAdmin)
            review = await Reviews.FindById(id, ["UserId"]);

        if (req.user.IsAdmin || HexToUUID(review.response?.UserId) == req.user.Id) {
            const r = await Reviews.Remove(id);

            return r.error == null ?
                res.json({ message: "Review has been removed successfully.", error: null }) :
                res.status(400).json({ message: null, error: r.error });
        }
        else
            return res.status(400).json({ message: null, error: "You haven't permission for this action" });
    }
    else
        return res.status(400).json({ message: null, error: "The id wasn't inserted." });
});

app.get("/api/review/getmany", async (req, res) => {
    const r = await Reviews.SelectMany(req.query);

    return r.error == null ?
        res.json(r) :
        res.status(400).json(r);
});

//Purchases

app.post("/api/purchase/add", async (req, res) => {
    const id = uuid.v4();
    req.body.Id = id;

    //Purchase with user's Id instead of its details
    if (req.body.FirstName == undefined) {
        if (req.user != null)
            req.body.UserId = req.user.Id;
        else
            return res.status(400).json({ error: "Invalid data." });
    }
        

    const products = req.body["Products"];
    delete req.body["Products"];

    const r = await Purchases.Add(req.body);

    if (r.error != null)
        return res.status(400).json({ message: null, error: r.error });

    try {
        const unhex = (val) => {
            return `UNHEX(REPLACE('${val}', '-', ''))`;
        }

        products.forEach(async (el) => {
            await db.execute(`INSERT INTO PurchaseProducts (Id, PurchaseId, Amount) 
                VALUES(${unhex(el.Id)}, ${unhex(id)}, ?)`, [el.Amount]);
        })

        return res.json({ message: "Purchase has been added successfully.", error: null });
    }
    catch (err) {
        return res.json({ message: null, error: err.message });
    }
});

//Users

app.get("/api/profile", async (req, res) => {
    try {
        if (req.query.Id != undefined) {
            const idField = `UNHEX(REPLACE('${req.query.Id}', '-', ''))`;

            //Gets average rating of company's products
            const [r1] = await db.execute(`
                SELECT AVG(Value) as Avg from REVIEWS as R
                INNER JOIN Products as P ON P.Id = R.ProductId
                INNER JOIN USERS as U ON U.Id = P.UserId
                WHERE U.Id = ${idField}
            `);

            //Gets company's details
            const r2 = await Users.FindById(req.query.Id, ["Username", "CreatedAt", "Avatar"]);

            if (r2.error == null) {
                //If it's ordinary user
                if (r2.response.Avatar == null)
                    return res.status(400).json({ error: "This isn't Id of Company." });

                //Conversion of rating to percentage
                const avg = r1[0].Avg != null ? r1[0].Avg / 5 * 100 : null;

                return res.json({ response: { ...r2.response, Avg: avg } });
            }
            else
                return res.status(400).json({ error: `Company with Id = ${req.query.Id} doesn't exist.` });
        }
        else
            return res.status(400).json({ error: "Undefined Id." });
    }
    catch (err) { return res.status(500).send();  }
});

app.post("/api/changeemail", IsAuthenticated, async (req, res) => {
    if (req.body.Email != undefined) {
        const r = await Users.Update({ Id: req.user.Id, Email: req.body.Email });

        return r.error == null ?
            res.json({ message: "Email has been successfully changed." }) :
            res.status(400).json(r);
    }
    else
        return res.status(400).json({ error: "Undefined email." });
});

app.post("/api/changepassword", IsAuthenticated, async (req, res) => {
    const {
        Password1: pass1,
        Password2: pass2
    } = req.body || {};

    if (pass1 == pass2 && pass1 != undefined) {
        try {
            const idVal = `UNHEX(REPLACE('${req.user.Id}', '-', ''))`;

            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(pass1, salt);

            await db.execute(`UPDATE UserPasswords SET PasswordHash = ? WHERE UserId = ${idVal}`, [hash]);

            return res.json({ message: "Password has been changed successfully." });
        }
        catch (err) { return res.status(500) }
    }
    else
        return res.status(400).json({ error: "Invalid data." });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});