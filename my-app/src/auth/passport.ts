import passportIns from "passport";
import { dbClient } from "@db/client";
import { eq } from "drizzle-orm";
import { users } from "@db/schema";
import { local } from "./passportLocal";
import { google } from "./passportOAuthGoogle";

passportIns.use(local);
passportIns.use("google", google);

passportIns.serializeUser(function (user, done) {
  done(null, user.id);
});

passportIns.deserializeUser<string>(async function (id, done) {
  const query = await dbClient.query.users.findFirst({
    where: eq(users.id, parseInt(id)),
  });
  if (!query) {
    done(null, false);
  } else {
    done(null, query);
  }
});

export default passportIns;
