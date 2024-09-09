ALTER TABLE "orders_history" ALTER COLUMN "price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders_history" ADD COLUMN "order_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "slips" ADD COLUMN "order_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders_history" ADD CONSTRAINT "orders_history_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
