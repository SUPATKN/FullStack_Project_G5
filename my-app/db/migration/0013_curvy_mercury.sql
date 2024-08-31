ALTER TABLE "images" ALTER COLUMN "price" SET DATA TYPE numeric(10, 2) USING price::integer;--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "price" SET DEFAULT '0';