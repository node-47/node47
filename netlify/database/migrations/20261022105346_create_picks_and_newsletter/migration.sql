CREATE TABLE "newsletter_subscribers" (
	"id" text PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "picks" (
	"id" text PRIMARY KEY,
	"sport" text NOT NULL,
	"competition" text NOT NULL,
	"match_name" text NOT NULL,
	"match_date" timestamp with time zone NOT NULL,
	"scenario_summary" text DEFAULT '' NOT NULL,
	"key_points" text DEFAULT '[]' NOT NULL,
	"key_stats" text DEFAULT '[]' NOT NULL,
	"alternative_scenario" text,
	"market" text DEFAULT '' NOT NULL,
	"selection" text DEFAULT '' NOT NULL,
	"line" text,
	"odds" double precision,
	"verdict" text DEFAULT 'JE_JOUE' NOT NULL,
	"confidence" text DEFAULT 'MODERE' NOT NULL,
	"condition" text,
	"synthesis" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"result" text DEFAULT 'PENDING' NOT NULL,
	"result_note" text,
	"settled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
