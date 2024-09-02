CREATE SEQUENCE cart_items_id_seq;
CREATE SEQUENCE carts_id_seq;

ALTER TABLE "cart_items" 
ALTER COLUMN "cart_item_id" SET DATA TYPE integer USING "cart_item_id"::integer,
ALTER COLUMN "cart_item_id" SET DEFAULT nextval('cart_items_id_seq');

ALTER TABLE "carts" 
ALTER COLUMN "cart_id" SET DATA TYPE integer USING "cart_id"::integer,
ALTER COLUMN "cart_id" SET DEFAULT nextval('carts_id_seq');
