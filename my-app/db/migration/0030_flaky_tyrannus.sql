-- Step 1: Add a new column
ALTER TABLE sessions ADD COLUMN expired_temp INTEGER;

-- Step 2: Migrate data (convert timestamp to integer epoch seconds)
UPDATE sessions SET expired_temp = EXTRACT(EPOCH FROM expired)::INTEGER;

-- Step 3: Drop the old column
ALTER TABLE sessions DROP COLUMN expired;

-- Step 4: Rename the new column
ALTER TABLE sessions RENAME COLUMN expired_temp TO expired;
