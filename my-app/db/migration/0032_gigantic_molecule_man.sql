DROP TABLE "admin_actions";--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "price" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "coins" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "status" varchar(20) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "purchases" DROP COLUMN IF EXISTS "amount";