CREATE TABLE IF NOT EXISTS "chain_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"chain_id" integer NOT NULL,
	"chain_name" varchar(100) NOT NULL,
	"chain_color" varchar(50),
	"chain_emoji" varchar(10),
	"status" varchar(50) NOT NULL,
	"position" integer,
	"completed" boolean DEFAULT false NOT NULL,
	"tx_completed" integer DEFAULT 0 NOT NULL,
	"tx_total" integer NOT NULL,
	"tx_latencies" json DEFAULT '[]'::json NOT NULL,
	"average_latency" integer,
	"total_latency" integer,
	"tx_hash" varchar(66),
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "race_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255),
	"description" text,
	"wallet_address" varchar(42),
	"transaction_count" integer NOT NULL,
	"status" varchar(50) DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transaction_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"chain_result_id" serial NOT NULL,
	"tx_index" integer NOT NULL,
	"tx_hash" varchar(66),
	"latency" integer NOT NULL,
	"block_number" integer,
	"raw_data" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chain_results" ADD CONSTRAINT "chain_results_session_id_race_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."race_sessions"("session_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction_details" ADD CONSTRAINT "transaction_details_chain_result_id_chain_results_id_fk" FOREIGN KEY ("chain_result_id") REFERENCES "public"."chain_results"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
