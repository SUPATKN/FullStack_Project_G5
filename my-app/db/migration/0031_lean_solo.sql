ALTER TABLE "slips" ADD COLUMN "coins" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "slips" DROP COLUMN IF EXISTS "price";