ALTER TABLE "images" ALTER COLUMN "price" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "price" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "price" DROP NOT NULL;