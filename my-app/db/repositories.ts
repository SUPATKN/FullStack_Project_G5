import { eq, like } from "drizzle-orm";
import { dbClient } from "@db/client";
import { sessionsTable, users, UserData } from "@db/schema";
import { type ProviderType, accountsTable } from "@db/schema";
import bcrypt from "bcrypt";

async function getUserFromId(id: number) {
  return dbClient.query.users.findFirst({
    where: eq(users.id, id),
  });
}

interface CheckUserOutput {
  user: typeof users.$inferSelect | null;
  isProviderAccountExist: boolean;
  isUserExist: boolean;
  accountId: number | null;
  userId: number | null;
}

export async function getAllUserSessions(userId: string) {
  if (!userId) return null;
  const likeString = `%${userId}%`;
  const results = await dbClient
    .select()
    .from(sessionsTable)
    .where(like(sessionsTable.sid, likeString));
  return results;
}

async function checkUser(email: string, provider: ProviderType) {
  const output: CheckUserOutput = {
    user: null,
    isProviderAccountExist: false,
    isUserExist: false,
    userId: null,
    accountId: null,
  };

  // Check user by email
  const userQuery = await dbClient.query.users.findFirst({
    where: eq(users.email, email),
    with: {
      accounts: true,
    },
  });
  if (userQuery) {
    output.user = userQuery;
    output.userId = userQuery.id;
    output.isUserExist = true;
    // Check if provider account exists
    const providerQuery = userQuery.accounts.find(
      (acc) => acc.provider === provider
    );
    if (providerQuery) {
      output.isProviderAccountExist = true;
      output.accountId = providerQuery.id;
    }
  }
  return output;
}

export async function handleUserData(uData: UserData) {
  const check = await checkUser(uData.email, uData.provider);

  if (!check.isUserExist) {
    // Create user
    const queryResult = await dbClient
      .insert(users)
      .values({
        username: uData.username,
        email: uData.email,
        isAdmin: false,
        password: "",
        avatarURL: uData.avatarURL,
        coin: 0,
      })
      .returning({ id: users.id });

    const userId = queryResult[0].id;
    await dbClient.insert(accountsTable).values({
      userId: userId,
      provider: uData.provider,
      providerAccountId: uData.providerAccountId,
      profile: uData.profile,
      accessToken: uData.accessToken,
      refreshToken: uData.refreshToken,
    });
    return getUserFromId(userId);
  } else {
    if (!check.isProviderAccountExist) {
      // Create provider account
      await dbClient.insert(accountsTable).values({
        userId: check.user?.id ?? 0,
        provider: uData.provider,
        providerAccountId: uData.providerAccountId,
        profile: uData.profile,
        accessToken: uData.accessToken,
        refreshToken: uData.refreshToken,
      });
      // Update avatar
    } else {
      // If provider account exists, update information
      await dbClient
        .update(accountsTable)
        .set({
          profile: uData.profile,
          accessToken: uData.accessToken,
          refreshToken: uData.refreshToken,
        })
        .where(eq(accountsTable.id, check.accountId ?? 0));
    }
    // Update user avatar so that I know which provider I am using right now. In production, I should let user update own avatar.
    if (uData?.avatarURL) {
      await dbClient
        .update(users)
        .set({ avatarURL: uData.avatarURL })
        .where(eq(users.id, check.userId ?? 0));
    }
    // Returning user
    return getUserFromId(check.user?.id ?? 0);
  }
}
