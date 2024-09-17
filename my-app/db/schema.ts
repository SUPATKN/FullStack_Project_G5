  import { relations } from "drizzle-orm";
  import {
    pgTable,
    serial,
    text,
    varchar,
    integer,
    timestamp,
    json,
    unique,
    boolean,
    decimal,
    primaryKey,
  } from "drizzle-orm/pg-core";

  export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 50 }).notNull(),
    email: varchar("email", { length: 100 }).unique().notNull(),
    isAdmin: boolean("is_admin").notNull().default(false),
    password: text("password").notNull(),
    avatarURL: text("avatar_url"),
    coin: integer("coin").default(0).notNull(),
  });

  export const accountsTable = pgTable(
    "accounts",
    {
      id: serial("id") // PostgreSQL serial type for auto-incrementing IDs
        .notNull()
        .unique(),
      userId: integer("user_id").notNull(), // Foreign key or reference to users table
      provider: text("provider", {
        enum: ["GOOGLE"], // Enum type to specify provider values
      }).notNull(),
      providerAccountId: text("provider_account").notNull(), // Provider account ID (e.g., from OAuth)
      profile: json("profile"), // JSON column to store user profile info
      accessToken: text("access_token"), // Optional access token
      refreshToken: text("refresh_token"), // Optional refresh token
    },
    (table) => {
      return {
        id: primaryKey({ columns: [table.userId, table.provider] }), // Composite key to ensure one provider type per user
      };
    }
  );

  export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accountsTable),
  }));

  export const accountsRelations = relations(accountsTable, ({ one }) => ({
    user: one(users, {
      fields: [accountsTable.userId],
      references: [users.id],
    }),
  }));

  export const sessionsTable = pgTable("sessions", {  
    sid: text("sid").primaryKey(),
    expired: timestamp("expire", { withTimezone: true }),
    sess: json("sess"),
  });

  export const images = pgTable("images", {
    id: serial("id").primaryKey(),
    path: text("path"),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    created_at: timestamp("created_at").defaultNow().notNull(),
    price: integer("price").default(0).notNull(),
    title:text("title"),
    max_sales: integer("max_sales"), 
    description:text("description"),
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
    cart_id: serial("cart_id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  });

  export const cart_items = pgTable("cart_items", {
    cart_item_id: serial("cart_item_id").primaryKey(),
    cart_id: integer("cart_id")
      .notNull()
      .references(() => carts.cart_id),
    photo_id: integer("photo_id")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
  });

  export const image_ownerships = pgTable("image_ownerships", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    image_id: integer("image_id")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    purchased_at: timestamp("purchased_at").defaultNow().notNull(),
  });

  export const coin_transactions = pgTable("coin_transactions", {
    transaction_id: serial("transaction_id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    transaction_type: varchar("transaction_type", { length: 50 }).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    description: text("description"),
  });

  export const slips = pgTable("slips", {
    slip_id: serial("slip_id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    coins: integer("coins").notNull(),
    slip_path: text("slip_path").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
    admin_note: text("admin_note"),
  });

  export const orders = pgTable("orders", {
    order_id: serial("order_id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(), // ราคาเหรียญที่สั่งซื้อ
    quantity: integer("quantity").notNull(), // จำนวนเหรียญที่สั่งซื้อ
    status: varchar("status", { length: 20 }).notNull().default("pending"), // สถานะการสั่งซื้อ: pending, approved, rejected
    created_at: timestamp("created_at").defaultNow().notNull(),
  });

  export const orders_history = pgTable("orders_history", {
    history_id: serial("history_id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    order_id: integer("order_id")
      .notNull()
      .references(() => orders.order_id, { onDelete: "cascade" }), // Foreign key reference to orders table
    coins: integer("coins").notNull(), // จำนวนเหรียญที่ซื้อ
    price: integer("price").notNull(), // ราคาเหรียญที่ซื้อ
    status: varchar("status", { length: 20 }).notNull().default(""),
    create_at: timestamp("create_at").defaultNow().notNull(), // วันที่ซื้อ
  });

  export const albums = pgTable("albums", {
    album_id: serial("album_id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  });

  export const photo_albums = pgTable("photo_albums", {
    photo_id: integer("photo_id")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    album_id: integer("album_id")
      .notNull()
      .references(() => albums.album_id, { onDelete: "cascade" }),
  });

  export type ProviderType = "GOOGLE";

  type UTI = typeof users.$inferInsert;
  type ATI = typeof accountsTable.$inferInsert;
  export type UserData = UTI & ATI;
