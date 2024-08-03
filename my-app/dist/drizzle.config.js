"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const drizzle_kit_1 = require("drizzle-kit");
const utils_1 = require("./db/utils");
exports.default = (0, drizzle_kit_1.defineConfig)({
    dialect: "postgresql",
    schema: "./db/schema.ts",
    out: "db/migration",
    dbCredentials: {
        url: utils_1.connectionString,
    },
    verbose: true,
    strict: true,
});
