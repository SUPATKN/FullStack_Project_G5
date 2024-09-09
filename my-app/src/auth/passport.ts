import passportIns from "passport";
import { dbClient } from "@db/client.js";
import { eq } from "drizzle-orm";
import { users } from "@db/schema.js";
import { local } from "./passportLocal.js";
import { google } from "./passportOAuthGoogle.js";

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
