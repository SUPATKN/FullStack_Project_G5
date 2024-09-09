-- 1. เพิ่มคอลัมน์ชั่วคราว
ALTER TABLE "accounts" ADD COLUMN "user_id_temp" integer;

-- 2. คัดลอกข้อมูลจากคอลัมน์เดิมไปยังคอลัมน์ชั่วคราว (แปลงเป็น integer)
UPDATE "accounts"
SET "user_id_temp" = CAST("user_id" AS integer);

-- 3. ลบคอลัมน์เดิม
ALTER TABLE "accounts" DROP COLUMN "user_id";

-- 4. เปลี่ยนชื่อคอลัมน์ชั่วคราวเป็น "user_id"
ALTER TABLE "accounts" RENAME COLUMN "user_id_temp" TO "user_id";
ALTER TABLE "users" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;