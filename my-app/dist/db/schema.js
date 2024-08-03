"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.images = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.images = (0, pg_core_1.pgTable)('images', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    path: (0, pg_core_1.text)('path'),
});
