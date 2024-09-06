CREATE TABLE IF NOT EXISTS "accounts" (
	"id" serial NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account" text NOT NULL,
	"profile" json,
	"access_token" text,
	"refresh_token" text,
	CONSTRAINT "accounts_user_id_provider_pk" PRIMARY KEY("user_id","provider"),
	CONSTRAINT "accounts_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"sid" text PRIMARY KEY NOT NULL,
	"expired" timestamp with time zone,
	"sess" json
);
