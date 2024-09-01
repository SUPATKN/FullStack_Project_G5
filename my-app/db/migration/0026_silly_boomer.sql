CREATE SEQUENCE ProfilePicture_id_seq;


ALTER TABLE "ProfilePicture" 
ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer,
ALTER COLUMN "id" SET DEFAULT nextval('ProfilePicture_id_seq');

ALTER TABLE "comments" 
ALTER COLUMN "comment_id" SET DATA TYPE integer USING "comment_id"::integer,
ALTER COLUMN "comment_id" SET DEFAULT nextval('comments_comment_id_seq');

ALTER TABLE "images" 
ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer,
ALTER COLUMN "id" SET DEFAULT nextval('images_id_seq');

ALTER TABLE "users" 
ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer,
ALTER COLUMN "id" SET DEFAULT nextval('users_id_seq');
