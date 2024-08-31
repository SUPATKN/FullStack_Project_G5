ALTER TABLE "images" ALTER COLUMN "price" SET DATA TYPE integer USING price::integer;--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "price" SET DEFAULT 0;