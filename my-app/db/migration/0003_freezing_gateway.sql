CREATE TABLE IF NOT EXISTS "withdraws" (
	"withdraw_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "withdraw";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "withdraws" ADD CONSTRAINT "withdraws_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
