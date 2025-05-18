import { Users } from "./models/DbModel.js";

import { Strategy as LocalStrategy } from "passport-local";
import * as bcrypt from "bcrypt";

export function Initialize(passport) {
    const authenticateUser = async (email, password, done) => {

        const user = await Users.FindByEmail(email,
            ["Id", "IsAdmin", "FirstName", "LastName",
                "Username", "Email", "Avatar", "Type"]);

        if (user == null)
            return done(null, false, { error: "Account with this Email wasn't found." });

        try {
            if (await Users.CheckPassword(email, password))
                return done(null, { ...user, IsCompany: user.Avatar != null });
            else 
                return done(null, false, { error: "The log in hasn't succeed." });
        }
        catch (err) {
            return done(err);
        }
    }

    //Authentication
    passport.use(new LocalStrategy({ usernameField: "Email", passwordField: "Password" }, authenticateUser));

    //Sets user's session
    passport.serializeUser((user, done) => done(null, {
        Id: user.Id, IsAdmin: user.IsAdmin == 1, Type: user.Type,
        Firstname: user.Firstname, LastName: user.LastName,
        Username: user.Username, Email: user.Email, IsCompany: user.Avatar != null
    }));

    //req.user value
    passport.deserializeUser((user, done) => done(null, user));
}