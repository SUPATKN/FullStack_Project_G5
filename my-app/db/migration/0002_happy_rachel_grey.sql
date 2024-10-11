CREATE TABLE IF NOT EXISTS "withdraw" (
	"withdraw_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "withdraws_history" (
	"history_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"withdraw_id" integer NOT NULL,
	"coins" integer NOT NULL,
	"price" integer NOT NULL,
	"status" varchar(20) DEFAULT '' NOT NULL,
	"create_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "withdraw" ADD CONSTRAINT "withdraw_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "withdraws_history" ADD CONSTRAINT "withdraws_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "withdraws_history" ADD CONSTRAINT "withdraws_history_withdraw_id_orders_order_id_fk" FOREIGN KEY ("withdraw_id") REFERENCES "public"."orders"("order_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
