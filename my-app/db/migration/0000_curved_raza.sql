CREATE TABLE IF NOT EXISTS "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" varchar NOT NULL,
	"filepath" text NOT NULL,
	"filetype" varchar NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
