import { eq, like } from "drizzle-orm";
import { dbClient } from "@db/client.js";
import { sessionsTable } from "@db/schema.js";
import { type ProviderType } from "@db/schema.js";
import bcrypt from "bcrypt";

export async function getAllUserSessions(userId: string) {
  if (!userId) return null;
  const likeString = `%${userId}%`;
  const results = await dbClient
    .select()
    .from(sessionsTable)
    .where(like(sessionsTable.sid, likeString));
  return results;
}
