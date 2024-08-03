ALTER TABLE "images" ADD COLUMN "path" text;--> statement-breakpoint
ALTER TABLE "images" DROP COLUMN IF EXISTS "filename";--> statement-breakpoint
ALTER TABLE "images" DROP COLUMN IF EXISTS "filepath";--> statement-breakpoint
ALTER TABLE "images" DROP COLUMN IF EXISTS "filetype";--> statement-breakpoint
ALTER TABLE "images" DROP COLUMN IF EXISTS "uploaded_at";