
import { users } from "@db/schema.js";

type usersTableType = typeof users.$inferSelect;

declare global {
  namespace Express {
    interface Request {
      // newField: string;
    }
    interface User extends usersTableType {}
  }
}

export {};
