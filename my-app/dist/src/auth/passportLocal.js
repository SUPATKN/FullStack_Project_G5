"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.local = void 0;
const passport_local_1 = require("passport-local");
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_js_1 = require("../../db/client.js");
const drizzle_orm_1 = require("drizzle-orm");
const schema_js_1 = require("../../db/schema.js");
exports.local = new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password",
}, function (email, password, done) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const query = yield client_js_1.dbClient.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_js_1.users.email, email),
        });
        if (!query)
            done(null, false, { message: "No email exists" });
        bcrypt_1.default.compare(password, (_a = query === null || query === void 0 ? void 0 : query.password) !== null && _a !== void 0 ? _a : "", function (err, result) {
            if (err)
                done(err, false);
            if (result) {
                return done(null, query);
            }
            else {
                return done(null, false, { message: "Incorrect Password" });
            }
        });
    });
});
