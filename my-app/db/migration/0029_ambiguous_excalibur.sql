CREATE TABLE IF NOT EXISTS "slips" (
	"slip_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"slip_path" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"admin_note" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "slips" ADD CONSTRAINT "slips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
