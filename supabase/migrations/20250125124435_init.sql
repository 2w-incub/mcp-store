-- NOTE: You can copy and paste this entire SQL file into the SQL editor in your Supabase dashboard
-- This will set up all required database tables and functions needed for:
-- 1. Clerk Authentication integration
-- 2. Stripe subscription management
-- 3. Required database policies and permissions
-- 4. MCP server management

create type "public"."pricing_plan_interval" as enum ('day', 'week', 'month', 'year');

create type "public"."pricing_type" as enum ('one_time', 'recurring');

create type "public"."subscription_status" as enum ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');

create table "public"."customers" (
    "id" text not null,
    "stripe_customer_id" text
);


alter table "public"."customers" enable row level security;

create table "public"."prices" (
    "id" text not null,
    "product_id" text,
    "active" boolean,
    "description" text,
    "unit_amount" bigint,
    "currency" text,
    "type" pricing_type,
    "interval" pricing_plan_interval,
    "interval_count" integer,
    "trial_period_days" integer,
    "metadata" jsonb
);


alter table "public"."prices" enable row level security;

create table "public"."products" (
    "id" text not null,
    "active" boolean,
    "name" text,
    "description" text,
    "image" text,
    "metadata" jsonb,
    "marketing_features" text[],
    "live_mode" boolean
);


alter table "public"."products" enable row level security;

create table "public"."subscriptions" (
    "id" text not null,
    "user_id" text not null,
    "status" subscription_status,
    "metadata" jsonb,
    "price_id" text,
    "quantity" integer,
    "cancel_at_period_end" boolean,
    "created" timestamp with time zone not null default timezone('utc'::text, now()),
    "current_period_start" timestamp with time zone not null default timezone('utc'::text, now()),
    "current_period_end" timestamp with time zone not null default timezone('utc'::text, now()),
    "ended_at" timestamp with time zone default timezone('utc'::text, now()),
    "cancel_at" timestamp with time zone default timezone('utc'::text, now()),
    "canceled_at" timestamp with time zone default timezone('utc'::text, now()),
    "trial_start" timestamp with time zone default timezone('utc'::text, now()),
    "trial_end" timestamp with time zone default timezone('utc'::text, now())
);


alter table "public"."subscriptions" enable row level security;

CREATE UNIQUE INDEX customers_pkey ON public.customers USING btree (id);

CREATE UNIQUE INDEX prices_pkey ON public.prices USING btree (id);

CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

alter table "public"."customers" add constraint "customers_pkey" PRIMARY KEY using index "customers_pkey";

alter table "public"."prices" add constraint "prices_pkey" PRIMARY KEY using index "prices_pkey";

alter table "public"."products" add constraint "products_pkey" PRIMARY KEY using index "products_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."prices" add constraint "prices_currency_check" CHECK ((char_length(currency) = 3)) not valid;

alter table "public"."prices" validate constraint "prices_currency_check";

alter table "public"."prices" add constraint "prices_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) not valid;

alter table "public"."prices" validate constraint "prices_product_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_price_id_fkey" FOREIGN KEY (price_id) REFERENCES prices(id) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_price_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.requesting_user_id()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
    SELECT NULLIF(
        current_setting('request.jwt.claims', true)::json->>'sub',
        ''
    )::text;
$function$
;

grant delete on table "public"."customers" to "anon";

grant insert on table "public"."customers" to "anon";

grant references on table "public"."customers" to "anon";

grant select on table "public"."customers" to "anon";

grant trigger on table "public"."customers" to "anon";

grant truncate on table "public"."customers" to "anon";

grant update on table "public"."customers" to "anon";

grant delete on table "public"."customers" to "authenticated";

grant insert on table "public"."customers" to "authenticated";

grant references on table "public"."customers" to "authenticated";

grant select on table "public"."customers" to "authenticated";

grant trigger on table "public"."customers" to "authenticated";

grant truncate on table "public"."customers" to "authenticated";

grant update on table "public"."customers" to "authenticated";

grant delete on table "public"."customers" to "postgres";

grant insert on table "public"."customers" to "postgres";

grant references on table "public"."customers" to "postgres";

grant select on table "public"."customers" to "postgres";

grant trigger on table "public"."customers" to "postgres";

grant truncate on table "public"."customers" to "postgres";

grant update on table "public"."customers" to "postgres";

grant delete on table "public"."customers" to "service_role";

grant insert on table "public"."customers" to "service_role";

grant references on table "public"."customers" to "service_role";

grant select on table "public"."customers" to "service_role";

grant trigger on table "public"."customers" to "service_role";

grant truncate on table "public"."customers" to "service_role";

grant update on table "public"."customers" to "service_role";

grant delete on table "public"."prices" to "anon";

grant insert on table "public"."prices" to "anon";

grant references on table "public"."prices" to "anon";

grant select on table "public"."prices" to "anon";

grant trigger on table "public"."prices" to "anon";

grant truncate on table "public"."prices" to "anon";

grant update on table "public"."prices" to "anon";

grant delete on table "public"."prices" to "authenticated";

grant insert on table "public"."prices" to "authenticated";

grant references on table "public"."prices" to "authenticated";

grant select on table "public"."prices" to "authenticated";

grant trigger on table "public"."prices" to "authenticated";

grant truncate on table "public"."prices" to "authenticated";

grant update on table "public"."prices" to "authenticated";

grant delete on table "public"."prices" to "postgres";

grant insert on table "public"."prices" to "postgres";

grant references on table "public"."prices" to "postgres";

grant select on table "public"."prices" to "postgres";

grant trigger on table "public"."prices" to "postgres";

grant truncate on table "public"."prices" to "postgres";

grant update on table "public"."prices" to "postgres";

grant delete on table "public"."prices" to "service_role";

grant insert on table "public"."prices" to "service_role";

grant references on table "public"."prices" to "service_role";

grant select on table "public"."prices" to "service_role";

grant trigger on table "public"."prices" to "service_role";

grant truncate on table "public"."prices" to "service_role";

grant update on table "public"."prices" to "service_role";

grant delete on table "public"."products" to "anon";

grant insert on table "public"."products" to "anon";

grant references on table "public"."products" to "anon";

grant select on table "public"."products" to "anon";

grant trigger on table "public"."products" to "anon";

grant truncate on table "public"."products" to "anon";

grant update on table "public"."products" to "anon";

grant delete on table "public"."products" to "authenticated";

grant insert on table "public"."products" to "authenticated";

grant references on table "public"."products" to "authenticated";

grant select on table "public"."products" to "authenticated";

grant trigger on table "public"."products" to "authenticated";

grant truncate on table "public"."products" to "authenticated";

grant update on table "public"."products" to "authenticated";

grant delete on table "public"."products" to "postgres";

grant insert on table "public"."products" to "postgres";

grant references on table "public"."products" to "postgres";

grant select on table "public"."products" to "postgres";

grant trigger on table "public"."products" to "postgres";

grant truncate on table "public"."products" to "postgres";

grant update on table "public"."products" to "postgres";

grant delete on table "public"."products" to "service_role";

grant insert on table "public"."products" to "service_role";

grant references on table "public"."products" to "service_role";

grant select on table "public"."products" to "service_role";

grant trigger on table "public"."products" to "service_role";

grant truncate on table "public"."products" to "service_role";

grant update on table "public"."products" to "service_role";

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant truncate on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant truncate on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "postgres";

grant insert on table "public"."subscriptions" to "postgres";

grant references on table "public"."subscriptions" to "postgres";

grant select on table "public"."subscriptions" to "postgres";

grant trigger on table "public"."subscriptions" to "postgres";

grant truncate on table "public"."subscriptions" to "postgres";

grant update on table "public"."subscriptions" to "postgres";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";

create policy "public read-only"
on "public"."prices"
as permissive
for select
to public
using (true);


create policy "public read-only"
on "public"."products"
as permissive
for select
to public
using (true);


create policy "owner"
on "public"."subscriptions"
as permissive
for select
to public
using ((requesting_user_id() = user_id));

-- MCP Server Management Tables

-- Servers Table
create table "public"."servers" (
    "id" uuid not null default uuid_generate_v4(),
    "name" varchar(200) not null,
    "description" text,
    "version_history" text,
    "compatibility" jsonb,
    "release_notes" text,
    "screenshots" text[],
    "developer_info" jsonb,
    "license" varchar(100),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);

alter table "public"."servers" enable row level security;

CREATE UNIQUE INDEX servers_pkey ON public.servers USING btree (id);
alter table "public"."servers" add constraint "servers_pkey" PRIMARY KEY using index "servers_pkey";

-- Reviews Table
create table "public"."reviews" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" text not null,
    "server_id" uuid not null,
    "rating" integer CHECK (rating BETWEEN 1 AND 5),
    "comment" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
);

alter table "public"."reviews" enable row level security;

CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);
alter table "public"."reviews" add constraint "reviews_pkey" PRIMARY KEY using index "reviews_pkey";
alter table "public"."reviews" add constraint "reviews_server_id_fkey" FOREIGN KEY (server_id) REFERENCES servers(id) not valid;
alter table "public"."reviews" validate constraint "reviews_server_id_fkey";

-- Installation Logs Table
create table "public"."installation_logs" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" text,
    "server_id" uuid not null,
    "status" varchar(50),
    "error_message" text,
    "attempted_at" timestamp with time zone not null default timezone('utc'::text, now())
);

alter table "public"."installation_logs" enable row level security;

CREATE UNIQUE INDEX installation_logs_pkey ON public.installation_logs USING btree (id);
alter table "public"."installation_logs" add constraint "installation_logs_pkey" PRIMARY KEY using index "installation_logs_pkey";
alter table "public"."installation_logs" add constraint "installation_logs_server_id_fkey" FOREIGN KEY (server_id) REFERENCES servers(id) not valid;
alter table "public"."installation_logs" validate constraint "installation_logs_server_id_fkey";

-- Analytics Table
create table "public"."analytics" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" text,
    "user_action" varchar(100),
    "details" jsonb,
    "recorded_at" timestamp with time zone not null default timezone('utc'::text, now())
);

alter table "public"."analytics" enable row level security;

CREATE UNIQUE INDEX analytics_pkey ON public.analytics USING btree (id);
alter table "public"."analytics" add constraint "analytics_pkey" PRIMARY KEY using index "analytics_pkey";

-- User Favorites Table
create table "public"."user_favorites" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" text not null,
    "server_id" uuid not null,
    "added_at" timestamp with time zone not null default timezone('utc'::text, now())
);

alter table "public"."user_favorites" enable row level security;

CREATE UNIQUE INDEX user_favorites_pkey ON public.user_favorites USING btree (id);
alter table "public"."user_favorites" add constraint "user_favorites_pkey" PRIMARY KEY using index "user_favorites_pkey";
alter table "public"."user_favorites" add constraint "user_favorites_server_id_fkey" FOREIGN KEY (server_id) REFERENCES servers(id) not valid;
alter table "public"."user_favorites" validate constraint "user_favorites_server_id_fkey";

-- Permissions for MCP Tables
grant select on table "public"."servers" to "anon";
grant select on table "public"."servers" to "authenticated";
grant all on table "public"."servers" to "service_role";

grant select on table "public"."reviews" to "anon";
grant all on table "public"."reviews" to "authenticated";
grant all on table "public"."reviews" to "service_role";

grant select on table "public"."installation_logs" to "authenticated";
grant insert on table "public"."installation_logs" to "authenticated";
grant all on table "public"."installation_logs" to "service_role";

grant insert on table "public"."analytics" to "anon";
grant insert on table "public"."analytics" to "authenticated";
grant all on table "public"."analytics" to "service_role";

grant select on table "public"."user_favorites" to "authenticated";
grant insert, delete on table "public"."user_favorites" to "authenticated";
grant all on table "public"."user_favorites" to "service_role";

-- RLS Policies
-- Servers: Everyone can read
CREATE POLICY "Enable read access for all users" ON "public"."servers"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Reviews: Everyone can read, authenticated users can create their own
CREATE POLICY "Enable read access for all users" ON "public"."reviews"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."reviews"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Installation Logs: Users can read and create their own logs
CREATE POLICY "Enable read for user's own logs" ON "public"."installation_logs"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON "public"."installation_logs"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Analytics: Anyone can insert
CREATE POLICY "Enable insert for all users" ON "public"."analytics"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

-- User Favorites: Users can manage their own favorites
CREATE POLICY "Enable read for user's own favorites" ON "public"."user_favorites"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON "public"."user_favorites"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for user's own favorites" ON "public"."user_favorites"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = user_id);



