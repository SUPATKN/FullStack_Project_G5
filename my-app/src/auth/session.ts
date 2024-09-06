import "dotenv/config";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { v4 as uuidv4 } from "uuid";
import { type Request } from "express";
import dayjs from "dayjs";
import { getAllUserSessions } from "@db/repositories.js";
import { type Details } from "express-useragent";
import { type ProviderType } from "@db/schema";
import { NODE_ENV } from "@/utils/env";
import { connectionString } from "@db/utils";

const generateSessionKey = (req: Request) => {
  const userId = req.user?.id ?? uuidv4();
  const randomId = uuidv4();
  return `sid:${userId}:${randomId}`;
};

const PgSessionStore = connectPgSimple(session);
const pgSessionStoreInstance = new PgSessionStore({
  conString: connectionString, // PostgreSQL connection string (e.g., from .env)
  tableName: "sessions", // Specify the sessions table name
});

const sessionIns = session({
  secret: "My Super Secret",
  cookie: {
    path: "/",
    httpOnly: true,
    secure: NODE_ENV === "production" ? true : false,
    maxAge: 60 * 60 * 1000,
    sameSite: "lax",
  },
  saveUninitialized: false,
  resave: false,
  store: pgSessionStoreInstance as session.Store,
  genid: generateSessionKey,
});

export default sessionIns;

export type LoginType = ProviderType | "CREDENTIAL";

export function setSessionInfoAfterLogin(req: Request, loginType: LoginType) {
  if (req.user && req.useragent) {
    req.session.useragent = req.useragent;
    req.session.createdAt = new Date().getTime();
    req.session.loginType = loginType;
  }
}

export async function formatSession(req: Request) {
  const sessions = await getAllUserSessions(String(req?.user?.id ?? ""));

  const sessionsMod = sessions?.map((session) => {
    const sess = session.sess as any;
    const createdAt = (sess?.createdAt ?? new Date().getTime()) as number;
    const dt = dayjs(createdAt);
    const useragent = (sess?.useragent ?? null) as Details | null;
    const useragentStr = useragent
      ? `${useragent.browser} - ${useragent.os}`
      : "Unknown Source";
    const loginType = (sess?.loginType ?? "") as LoginType | "";
    return {
      ...session,
      isOwnSession: session.sid === req.sessionID,
      createdAtStr: dt.format("DD/MM/YYYY HH:mm:ss"),
      createdAtDt: dt,
      useragentStr: useragentStr,
      loginType: loginType,
    };
  });

  return sessionsMod;
}
