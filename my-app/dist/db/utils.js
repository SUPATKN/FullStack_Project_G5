"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionString = void 0;
require("dotenv/config");
const dbUser = process.env.POSTGRES_APP_USER;
const dbPassword = process.env.POSTGRES_APP_PASSWORD;
const dbHost = process.env.POSTGRES_HOST;
const dbPort = process.env.POSTGRES_PORT;
const dbName = process.env.POSTGRES_DB;
console.log({
    dbUser,
    dbPassword,
    dbHost,
    dbPort,
    dbName,
});
if (!dbUser || !dbPassword || !dbHost || !dbName || !dbName) {
    throw new Error("Invalid DB env.");
}
exports.connectionString = `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
