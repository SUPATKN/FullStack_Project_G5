CREATE TABLE IF NOT EXISTS "ProfilePicture" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProfilePicture" ADD CONSTRAINT "ProfilePicture_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
