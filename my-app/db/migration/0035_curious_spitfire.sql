ALTER TABLE "orders_history" DROP CONSTRAINT "orders_history_order_id_orders_order_id_fk";
--> statement-breakpoint
ALTER TABLE "orders_history" DROP COLUMN IF EXISTS "order_id";