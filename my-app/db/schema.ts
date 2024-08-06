import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  decimal,
  unique,
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
  created_at: timestamp("created_at").defaultNow().notNull(),
  price: integer("price").default(0).notNull(),
});

export const likes = pgTable(
  "likes",
  {
    photo_id: integer("photo_id")
      .notNull()
      .references(() => images.id),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id),
  },
  (table) => {
    return {
      uniqueConstraint: unique().on(table.photo_id, table.user_id),
    };
  }
);

export const comments = pgTable("comments", {
  comment_id: serial("comment_id").primaryKey(),
  photo_id: integer("photo_id")
    .notNull()
    .references(() => images.id),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// import { pgTable, dropTable } from "drizzle-orm/pg-core";

// export const down = async (queryInterface) => {
//   await queryInterface.dropTable('transaction_history');
//   await queryInterface.dropTable('transactions');
//   await queryInterface.dropTable('currencies');
// };
