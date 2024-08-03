import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  foreignKey,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  password: text("password").notNull(),
});

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  path: text("path"),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
});
