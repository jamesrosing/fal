create table "public"."placeholders" (
    "placeholder_id" text not null,
    "type" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


CREATE UNIQUE INDEX placeholders_pkey ON public.placeholders USING btree (placeholder_id);

alter table "public"."placeholders" add constraint "placeholders_pkey" PRIMARY KEY using index "placeholders_pkey";

grant delete on table "public"."placeholders" to "anon";

grant insert on table "public"."placeholders" to "anon";

grant references on table "public"."placeholders" to "anon";

grant select on table "public"."placeholders" to "anon";

grant trigger on table "public"."placeholders" to "anon";

grant truncate on table "public"."placeholders" to "anon";

grant update on table "public"."placeholders" to "anon";

grant delete on table "public"."placeholders" to "authenticated";

grant insert on table "public"."placeholders" to "authenticated";

grant references on table "public"."placeholders" to "authenticated";

grant select on table "public"."placeholders" to "authenticated";

grant trigger on table "public"."placeholders" to "authenticated";

grant truncate on table "public"."placeholders" to "authenticated";

grant update on table "public"."placeholders" to "authenticated";

grant delete on table "public"."placeholders" to "service_role";

grant insert on table "public"."placeholders" to "service_role";

grant references on table "public"."placeholders" to "service_role";

grant select on table "public"."placeholders" to "service_role";

grant trigger on table "public"."placeholders" to "service_role";

grant truncate on table "public"."placeholders" to "service_role";

grant update on table "public"."placeholders" to "service_role";


