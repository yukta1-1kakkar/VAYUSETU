CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "route_weights" (
    "id" SERIAL PRIMARY KEY,
    "route_id" VARCHAR(50) NOT NULL UNIQUE,
    "origin" VARCHAR(50) NOT NULL,
    "destination" VARCHAR(50) NOT NULL,
    "total_passengers" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "scrape_runs" (
    "id" VARCHAR(36) PRIMARY KEY,
    "source" VARCHAR(80) NOT NULL,
    "source_file" VARCHAR(255) NOT NULL,
    "file_checksum" VARCHAR(64) NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "status" VARCHAR(30) NOT NULL DEFAULT 'running',
    "input_count" INTEGER NOT NULL DEFAULT 0,
    "clean_count" INTEGER NOT NULL DEFAULT 0,
    "unavailable_count" INTEGER NOT NULL DEFAULT 0,
    "outlier_count" INTEGER NOT NULL DEFAULT 0,
    "rejected_count" INTEGER NOT NULL DEFAULT 0,
    "inserted_count" INTEGER NOT NULL DEFAULT 0,
    "updated_count" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "fare_observations" (
    "id" SERIAL PRIMARY KEY,
    "observation_id" VARCHAR(80),
    "record_fingerprint" VARCHAR(64) UNIQUE,
    "scrape_run_id" VARCHAR(36),
    "route_id" VARCHAR(50) NOT NULL,
    "airline" VARCHAR(80) NOT NULL,
    "airline_code" VARCHAR(10),
    "flight_number" VARCHAR(80),
    "travel_date" DATE NOT NULL,
    "observation_date" DATE NOT NULL,
    "advance_purchase_days" INTEGER NOT NULL,
    "collected_at" TIMESTAMPTZ(6),
    "departure_time" TIMESTAMPTZ(6),
    "arrival_time" TIMESTAMPTZ(6),
    "trip_type" VARCHAR(20) NOT NULL DEFAULT 'one_way',
    "cabin" VARCHAR(30) NOT NULL DEFAULT 'economy',
    "fare_family" VARCHAR(80),
    "stops" INTEGER,
    "duration_minutes" INTEGER,
    "fare" DOUBLE PRECISION,
    "base_fare" DOUBLE PRECISION,
    "taxes" DOUBLE PRECISION,
    "user_development_fee" DOUBLE PRECISION,
    "convenience_fee" DOUBLE PRECISION,
    "mandatory_fees" DOUBLE PRECISION,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "source" VARCHAR(80) NOT NULL DEFAULT 'scraper',
    "source_type" VARCHAR(80),
    "seller_name" VARCHAR(100),
    "source_url" TEXT,
    "availability_status" VARCHAR(40) NOT NULL DEFAULT 'available',
    "seats_available" INTEGER,
    "no_flights" BOOLEAN,
    "sold_out" BOOLEAN,
    "scrape_outcome" VARCHAR(80),
    "data_quality_score" DOUBLE PRECISION,
    "cleaning_status" VARCHAR(30) NOT NULL DEFAULT 'clean',
    "is_outlier" BOOLEAN NOT NULL DEFAULT false,
    "rejection_reason" TEXT,
    "raw_payload" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fare_observations_route_id_fkey" FOREIGN KEY ("route_id")
        REFERENCES "route_weights"("route_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fare_observations_scrape_run_id_fkey" FOREIGN KEY ("scrape_run_id")
        REFERENCES "scrape_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "rejected_observations" (
    "id" SERIAL PRIMARY KEY,
    "scrape_run_id" VARCHAR(36) NOT NULL,
    "source" VARCHAR(80),
    "route_id" VARCHAR(50),
    "reason" TEXT NOT NULL,
    "raw_payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rejected_observations_scrape_run_id_fkey" FOREIGN KEY ("scrape_run_id")
        REFERENCES "scrape_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "cpi_reference" (
    "id" SERIAL PRIMARY KEY,
    "month" VARCHAR(20) NOT NULL UNIQUE,
    "combined_index" DOUBLE PRECISION NOT NULL,
    "inflation_pct" DOUBLE PRECISION
);

CREATE INDEX "route_weights_origin_idx" ON "route_weights"("origin");
CREATE INDEX "route_weights_destination_idx" ON "route_weights"("destination");
CREATE INDEX "scrape_runs_source_idx" ON "scrape_runs"("source");
CREATE INDEX "scrape_runs_file_checksum_idx" ON "scrape_runs"("file_checksum");
CREATE INDEX "fare_observations_observation_id_idx" ON "fare_observations"("observation_id");
CREATE INDEX "fare_observations_scrape_run_id_idx" ON "fare_observations"("scrape_run_id");
CREATE INDEX "fare_observations_route_id_idx" ON "fare_observations"("route_id");
CREATE INDEX "fare_observations_airline_idx" ON "fare_observations"("airline");
CREATE INDEX "fare_observations_airline_code_idx" ON "fare_observations"("airline_code");
CREATE INDEX "fare_observations_flight_number_idx" ON "fare_observations"("flight_number");
CREATE INDEX "fare_observations_travel_date_idx" ON "fare_observations"("travel_date");
CREATE INDEX "fare_observations_observation_date_idx" ON "fare_observations"("observation_date");
CREATE INDEX "fare_observations_advance_purchase_days_idx" ON "fare_observations"("advance_purchase_days");
CREATE INDEX "fare_observations_collected_at_idx" ON "fare_observations"("collected_at");
CREATE INDEX "fare_observations_availability_status_idx" ON "fare_observations"("availability_status");
CREATE INDEX "fare_observations_cleaning_status_idx" ON "fare_observations"("cleaning_status");
CREATE INDEX "fare_observations_is_outlier_idx" ON "fare_observations"("is_outlier");
CREATE INDEX "idx_route_obs_adv" ON "fare_observations"("route_id", "observation_date", "advance_purchase_days");
CREATE INDEX "idx_route_airline_dates" ON "fare_observations"("route_id", "airline", "travel_date", "observation_date", "advance_purchase_days");
CREATE INDEX "idx_clean_index_input" ON "fare_observations"("observation_date", "advance_purchase_days", "cleaning_status");
CREATE INDEX "rejected_observations_scrape_run_id_idx" ON "rejected_observations"("scrape_run_id");
