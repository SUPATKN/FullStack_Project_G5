import { type Details } from "express-useragent";
import { type LoginType } from "@src/auth/session.ts";
// https://stackoverflow.com/a/65805410

type UsersTableType = typeof users.$inferSelect;

declare module "express-session" {
  interface SessionData {
    useragent?: Details;
    createdAt?: number;
    loginType: LoginType;
    user?: UsersTableType;
  }
}

export {};
