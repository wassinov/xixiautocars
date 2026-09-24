-- Trigger function (already exists from cars table)
-- Reuse update_updated_at_column() function

-- Add updated_at column to tables that don't have it yet
alter table brands add column if not exists updated_at timestamp with time zone not null default now();
alter table models add column if not exists updated_at timestamp with time zone not null default now();
alter table car_images add column if not exists updated_at timestamp with time zone not null default now();
alter table garage_infos add column if not exists updated_at timestamp with time zone not null default now();
alter table contact_messages add column if not exists updated_at timestamp with time zone not null default now();

-- Add triggers to remaining tables
-- (Rendu idempotent : ré-exécutable sans erreur — drop avant create)
drop trigger if exists update_brands_updated_at on brands;
drop trigger if exists update_models_updated_at on models;
drop trigger if exists update_car_images_updated_at on car_images;
drop trigger if exists update_garage_infos_updated_at on garage_infos;
drop trigger if exists update_contact_messages_updated_at on contact_messages;

create trigger update_brands_updated_at
before update on brands
for each row
execute procedure update_updated_at_column();

create trigger update_models_updated_at
before update on models
for each row
execute procedure update_updated_at_column();

create trigger update_car_images_updated_at
before update on car_images
for each row
execute procedure update_updated_at_column();

create trigger update_garage_infos_updated_at
before update on garage_infos
for each row
execute procedure update_updated_at_column();

create trigger update_contact_messages_updated_at
before update on contact_messages
for each row
execute procedure update_updated_at_column();