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
const passport_1 = __importDefault(require("passport"));
const client_js_1 = require("../../db/client.js");
const drizzle_orm_1 = require("drizzle-orm");
const schema_js_1 = require("../../db/schema.js");
const passportLocal_js_1 = require("./passportLocal.js");
passport_1.default.use(passportLocal_js_1.local);
passport_1.default.serializeUser(function (user, done) {
    done(null, user.id);
});
passport_1.default.deserializeUser(function (id, done) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = yield client_js_1.dbClient.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_js_1.users.id, parseInt(id)),
        });
        if (!query) {
            done(null, false);
        }
        else {
            done(null, query);
        }
    });
});
exports.default = passport_1.default;
