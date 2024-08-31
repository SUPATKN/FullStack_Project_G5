ALTER TABLE "images" ALTER COLUMN "price" SET DATA TYPE decimal(10, 2) USING price::numeric;--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "price" SET DEFAULT '0';