import * as server from "../server.js";
import * as bcrypt from "bcrypt";

export function HexToUUID(hex) {
    hex = hex.toLowerCase();

    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}


//Forbidden Columns
const fObjCols = {
    Reviews: ["Id", "CreatedAt"],
    Products: ["RatingCount", "Rating", "TotalRatings", "Bought", "CreatedAt"],
    Purchases: [],
    Users: []
};

function IsValidJSON(str, send = false) {
    try {
        const val = JSON.parse(str);

        return send ? val : true;
    } catch (e) {
        return send ? null : false;
    }
};

//Normalizes BINARY columns
function ConvertColumns(el, model, isUUID) {
    const columns = ["Id", "UserId", "PostId"];

    if (columns.includes(el) && ((el == "Id" && isUUID) || el != "Id"))
        return `HEX(${model}.\`${el}\`) as \`${el}\``;
    else
        return `${model}.\`${el}\``;
};

export class DbModel {
    static model = "model";
    static isUUID = false;

    static async FindById(id, columns, join) {
        let query = "SELECT ";

        query += columns.map(col => ConvertColumns(col, this.model, this.isUUID)).join(",");

        //Join columns
        if (join?.columns != undefined)
            query += `,${join.columns.map(el => `\`${join.table}\`.\`${el}\``).join(",")}`;

        query += ` FROM ${this.model}`;

        //Join
        if (join?.table != undefined)
            query += ` INNER JOIN \`${join.table}\` ON \`${join.table}\`.Id = ${this.model}.\`${join.on}\``;

        //Handles INT / BINARY Id
        query += ` WHERE ${this.model}.Id = ${this.isUUID ? `UNHEX(REPLACE('${id}', "-", ''))` : id}`;

        try {
            const [r] = await server.db.execute(query);

            return r.length == 0 ?
                { error: `The element with id = ${id} doesn't exist in a database.` } :
                { response: r[0], error: null };
        }
        catch (err) { return { error: err.message }; }
    }

    static async SelectMany(body) {
        let countQuery = `SELECT COUNT(*) as Count FROM ${this.model}`;
        let query = "SELECT ";

        const columns = body["Columns"];
        let vals = [];

        query += columns.map(el => ConvertColumns(el, this.model, this.isUUID)).join(",");

        const join = IsValidJSON(body.join, true);

        //Join columns
        if (join?.columns != undefined)
            query += `,${join.columns.map(el => `\`${join.table}\`.\`${el}\``).join(",")}`;

        query += ` FROM ${this.model}`;

        //Join
        if (join != null)
            query += ` INNER JOIN \`${join.table}\` ON \`${join.table}\`.Id = ${this.model}.\`${join.on}\``;

        const whereFun = (cond, condVal) => {
            if (["Id", "UserId", "ProductId"].includes(cond))
                return `= UNHEX(REPLACE('${condVal}', '-', ''))`;
            else if (!IsValidJSON(condVal)) {
                if (typeof condVal != "string") {
                    vals.push(condVal);
                    return "= ?";
                }
                else 
                    return `LIKE '%${condVal}%'`;
            }
            else {
                const json = JSON.parse(condVal);

                if (cond != "Price")
                    return `IN (${json.map(el => `'${el}'`).join(",")})`;
                else if (json.length == 2) {
                    if (json[0] != null && json[1] != null)
                        return `BETWEEN '${json[0]}' AND '${json[1]}'`;
                    else if (json[0] == null)
                        return `<= ${json[1]}`;
                    else 
                        return `>= ${json[0]}`;
                }
            }
        };

        //WHERE
        if (body["Condition"] != undefined) {
            if (typeof body["Condition"] != "object") {
                const where = ` WHERE ${this.model}.\`${body["Condition"]}\` ${whereFun(body["Condition"], body["CondVal"])}`;

                query += where;
                countQuery += where;
            }
            else {
                const conditions = body["Condition"].map((cond, i) => {
                    return cond = `${this.model}.\`${cond}\` ${whereFun(cond, body["CondVal"][i])}`;
                }).join(" AND ");

                const where = ` WHERE ${conditions}`;

                query += where;
                countQuery += where;
            }
        }

        //ORDER BY
        if (body["OrderBy"] != undefined) {
            const order = body["Order"] == "true" ? "ASC" : "DESC";
            const orderBy = body["OrderBy"] == "RAND()" ? body["OrderBy"] : `\`${body["OrderBy"]}\``;

            query += ` ORDER BY ${body["OrderBy"] != "RAND()"? `${this.model}.` : ""}${orderBy} ${order}`;
        }

        //LIMIT
        if (body["Page"] != undefined) {
            const offset = (body["Page"] - 1) * body["Rows"];
            query += ` LIMIT ${offset}, ${parseInt(body["Rows"])}`;
        }

        try {
            const [r] = await server.db.execute(query);
            const [cr] = await server.db.execute(countQuery);

            return { response: { Elements: r, Count: cr[0].Count }, error: null };
        }
        catch (err) { return { error: err.message }; }
    }

    static async Add(obj) {
        //Inserted obj columns
        const keys = Object.keys(obj);
        const func = el => fObjCols[this.model].includes(el);

        //Checks whether user tries to insert forbidden columns
        if (!keys.some(func)) {      
            //Handles binary columns
            const convertValues = (obj, key) => {
                const columns = ["Id", "UserId", "ProductId"];

                if (columns.includes(key) && ((key == "Id" && this.isUUID) || key != "Id"))
                    return `UNHEX(REPLACE(\'${obj[key]}\', \'-\', \'\'))`;
                else
                    return `\'${obj[key]}\'`;
            };

            let query = `INSERT INTO ${this.model} `;
            let vals = [];

            //if Id wasn't given
            if (this.model != "Reviews" && obj["Id"] == null)
                obj["Id"] = server.uuid.v4();

            keys.forEach(key => {
                //Values list
                vals.push(convertValues(obj, key));
            });
            
            query += `(${keys.map(col => `\`${col}\``)}) VALUES (${vals.map((el) => el).join(",")})`;

            try {
                await server.db.execute(query, [...vals]);
                return { error: null };
            }
            catch (err) { return { error: err.message }; }
        }
        else
            return { error: "Invalid columns." };
;
    }

    static async Remove(id) {
        if (id == undefined)
            return null;

        let query = `DELETE FROM ${this.model} WHERE Id = `;
        //Handles INT / Binary Id
        query += this.isUUID ? `UNHEX(REPLACE('${id}', '-', ''))` : id;

        try {
            await server.db.execute(query, []);
            return { error: null };
        }
        catch (err) { return { error: err.message }; }
    }

    static async Update(body) {
        if (body["Id"] == undefined)
            return res.status(400).send();

        //Updated columns of obj
        const keys = Object.keys(body);
        const func = el => fObjCols[this.model].includes(el);

        let query = `UPDATE ${this.model} SET `;
        let params = [];
        let vals = [];

        keys.forEach(key => {
            if (!func(key)) {
                //Sets columns to update
                params.push(`\`${key}\` = ?`);
                //Values
                vals.push(body[key]);
            }
        });

        query += params.join(",");
        query += " WHERE Id = ";
        //Handles INT / BINARY Id
        query += this.isUUID ? `UNHEX(REPLACE('${body["Id"]}', '-', ''))` : body["Id"];

        try {
            await server.db.execute(query, [...vals]);

            return { error: null };
        }
        catch (err) { return { error: err.message }; }
    }
}

export class Users extends DbModel {
    static model = "Users";
    static isUUID = true;

    static async FindByEmail(email, columns) {
        let query = "SELECT ";

        //Id
        query += columns.map(el => el != "Id" ? `\`${el}\`` : `HEX(Id) as Id`).join(",");
        query += ` FROM ${this.model} WHERE Email = ?`;

        try {
            const [r] = await server.db.execute(query, [email]);

            if (r.length != 0) {
                if (r[0].Id != undefined)
                    r[0].Id = HexToUUID(r[0].Id);

                return r[0];
            }
            else
                return null;
        }
        catch (err) { return null }
    }

    static async FindByUsername(username, columns) {
        let query = "SELECT ";

        //Id
        query += columns.map(el => el != "Id" ? `\`${el}\`` : `HEX(Id) as Id`).join(",");
        query += ` FROM ${this.model} WHERE Username = ?`;

        try {
            const [r] = await server.db.query(query, [username]);

            if (r.length != 0) {
                if (r[0].Id != undefined)
                    r[0].Id = HexToUUID(r[0].Id);

                return r[0];
            }
            else
                return null;
        }
        catch (err) { return null }
    }

    static async CheckPassword(email, password) {
        try {
            const [r] = await server.db.execute(`SELECT PasswordHash FROM UserPasswords UP
                JOIN Users U on U.Id = UP.UserId
                WHERE U.Email = ?`, [email]);

            return bcrypt.compareSync(password, r[0].PasswordHash);
        }
        catch (err) { return false; }
    }
}

export class Products extends DbModel {
    static model = "Products";
    static isUUID = true;
}

export class Reviews extends DbModel {
    static model = "Reviews";
    static isUUID = false;
}

export class Purchases extends DbModel {
    static model = "Purchases";
    static isUUID = true;
}
