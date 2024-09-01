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
    .references(() => users.id, {
      onDelete: "cascade", // Automatically delete related rows in 'images' when a user is deleted
    }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  price: integer("price").default(0).notNull(),
});

export const ProfilePicture = pgTable("ProfilePicture", {
  id: serial("id").primaryKey(),
  path: text("path"),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade", // Automatically delete related rows in 'images' when a user is deleted
    }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const likes = pgTable(
  "likes",
  {
    photo_id: integer("photo_id")
      .notNull()
      .references(() => images.id, {
        onDelete: "cascade",
      }),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
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
    .references(() => images.id, {
      onDelete: "cascade",
    }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
export const carts = pgTable("carts", {
  cart_id: integer("cart_id").primaryKey(),  
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(), 
  updated_at: timestamp("updated_at").defaultNow().notNull(),  
});

export const cart_items = pgTable("cart_items", {
  cart_item_id: integer("cart_item_id").primaryKey(), 
  cart_id: integer("cart_id")
    .notNull()
    .references(() => carts.cart_id),  
  photo_id: integer("photo_id")
    .notNull()
    .references(() => images.id), 
});


