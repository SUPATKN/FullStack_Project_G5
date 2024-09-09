CREATE TABLE IF NOT EXISTS "orders_history" (
	"history_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"coins" integer NOT NULL,
	"price" integer NOT NULL,
	"status" varchar(20) DEFAULT '' NOT NULL,
	"create_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "purchases";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders_history" ADD CONSTRAINT "orders_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
