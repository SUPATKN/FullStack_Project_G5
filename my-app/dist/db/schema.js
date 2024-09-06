"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coin_transactions = exports.image_ownerships = exports.cart_items = exports.carts = exports.comments = exports.likes = exports.ProfilePicture = exports.images = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.varchar)("username", { length: 50 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 100 }).unique().notNull(),
    password: (0, pg_core_1.text)("password").notNull(),
    coin: (0, pg_core_1.integer)("coin").default(0).notNull(),
});
exports.images = (0, pg_core_1.pgTable)("images", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    path: (0, pg_core_1.text)("path"),
    user_id: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, {
        onDelete: "cascade", // Automatically delete related rows in 'images' when a user is deleted
    }),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    price: (0, pg_core_1.integer)("price").default(0).notNull(),
});
exports.ProfilePicture = (0, pg_core_1.pgTable)("ProfilePicture", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    path: (0, pg_core_1.text)("path"),
    user_id: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, {
        onDelete: "cascade", // Automatically delete related rows in 'images' when a user is deleted
    }),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.likes = (0, pg_core_1.pgTable)("likes", {
    photo_id: (0, pg_core_1.integer)("photo_id")
        .notNull()
        .references(() => exports.images.id, {
        onDelete: "cascade",
    }),
    user_id: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, {
        onDelete: "cascade",
    }),
}, (table) => {
    return {
        uniqueConstraint: (0, pg_core_1.unique)().on(table.photo_id, table.user_id),
    };
});
exports.comments = (0, pg_core_1.pgTable)("comments", {
    comment_id: (0, pg_core_1.serial)("comment_id").primaryKey(),
    photo_id: (0, pg_core_1.integer)("photo_id")
        .notNull()
        .references(() => exports.images.id, {
        onDelete: "cascade",
    }),
    user_id: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, {
        onDelete: "cascade",
    }),
    content: (0, pg_core_1.text)("content").notNull(),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.carts = (0, pg_core_1.pgTable)("carts", {
    cart_id: (0, pg_core_1.serial)("cart_id").primaryKey(),
    user_id: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.cart_items = (0, pg_core_1.pgTable)("cart_items", {
    cart_item_id: (0, pg_core_1.serial)("cart_item_id").primaryKey(),
    cart_id: (0, pg_core_1.integer)("cart_id")
        .notNull()
        .references(() => exports.carts.cart_id),
    photo_id: (0, pg_core_1.integer)("photo_id")
        .notNull()
        .references(() => exports.images.id),
});
exports.image_ownerships = (0, pg_core_1.pgTable)("image_ownerships", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    user_id: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    image_id: (0, pg_core_1.integer)("image_id")
        .notNull()
        .references(() => exports.images.id, { onDelete: "cascade" }),
    purchased_at: (0, pg_core_1.timestamp)("purchased_at").defaultNow().notNull(),
});
exports.coin_transactions = (0, pg_core_1.pgTable)("coin_transactions", {
    transaction_id: (0, pg_core_1.serial)("transaction_id").primaryKey(),
    user_id: (0, pg_core_1.integer)("user_id")
        .notNull()
        .references(() => exports.users.id, { onDelete: "cascade" }),
    amount: (0, pg_core_1.integer)("amount").notNull(),
    transaction_type: (0, pg_core_1.varchar)("transaction_type", { length: 50 }).notNull(),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    description: (0, pg_core_1.text)("description"),
});
