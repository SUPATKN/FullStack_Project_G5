-- Step 1: Add a new column
ALTER TABLE "sessions" ADD COLUMN "expire_new" TIMESTAMP WITH TIME ZONE;

-- Step 2: Migrate existing data
UPDATE "sessions" SET "expire_new" = to_timestamp("expire");

-- Step 3: Drop the old column
ALTER TABLE "sessions" DROP COLUMN "expire";

-- Step 4: Rename the new column
ALTER TABLE "sessions" RENAME COLUMN "expire_new" TO "expire";
