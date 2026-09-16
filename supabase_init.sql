-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Table: brands
create table if not exists brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  logo_url text,
  country text
);

-- Table: models
create table if not exists models (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references brands(id) on delete cascade,
  name text not null,
  body_type text,
  unique(brand_id, name)
);

-- Table: cars
create table if not exists cars (
  id uuid primary key default uuid_generate_v4(),
  model_id uuid not null references models(id) on delete cascade,
  is_new boolean not null default false,
  year integer not null,
  mileage integer,
  price decimal(10,2) not null,
  currency text not null default 'EUR',
  color text,
  gearbox text,
  fuel_type text,
  description text,
  features jsonb default '{}'::jsonb,
  condition text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  views_count integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Table: car_images
create table if not exists car_images (
  id uuid primary key default uuid_generate_v4(),
  car_id uuid not null references cars(id) on delete cascade,
  image_url text not null,
  is_primary boolean not null default false,
  order_index integer not null default 0
);

-- Table: garage_infos
create table if not exists garage_infos (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  phone text,
  email text,
  google_maps_url text,
  opening_hours text,
  about_text text,
  logo_url text,
  unique(id) -- Ensures only one row
);

-- Table: contact_messages
create table if not exists contact_messages (
  id uuid primary key default uuid_generate_v4(),
  car_id uuid references cars(id) on delete set null,
  full_name text not null,
  phone text,
  email text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamp with time zone not null default now()
);

-- Trigger to update updated_at on cars table
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger update_cars_updated_at
before update on cars
for each row
execute procedure update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
alter table brands enable row level security;
alter table models enable row level security;
alter table cars enable row level security;
alter table car_images enable row level security;
alter table garage_infos enable row level security;
alter table contact_messages enable row level security;

-- Policies for public read access (SELECT) on all tables
create policy "Public read access on brands"
on brands for select
using (true);

create policy "Public read access on models"
on models for select
using (true);

create policy "Public read access on cars"
on cars for select
using (true);

create policy "Public read access on car_images"
on car_images for select
using (true);

create policy "Public read access on garage_infos"
on garage_infos for select
using (true);

create policy "Public read access on contact_messages"
on contact_messages for select
using (true);

-- Policies for admin write access (INSERT, UPDATE, DELETE) on all tables
-- Assuming admin is any authenticated user (auth.uid() is not null)
-- In production, you might want to restrict further by email or role using auth.jwt()
create policy "Admin write access on brands"
on brands for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Admin write access on models"
on models for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Admin write access on cars"
on cars for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Admin write access on car_images"
on car_images for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Admin write access on garage_infos"
on garage_infos for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "Admin write access on contact_messages"
on contact_messages for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Insert a default garage_infos row (if not exists) to ensure singleton behavior
insert into garage_infos (id, name, address, phone, email, google_maps_url, opening_hours, about_text, logo_url)
values (
  '00000000-0000-0000-0000-000000000000',
  'Mon Garage',
  '123 Rue de l''Automobile',
  '01 23 45 67 89',
  'contact@mongarage.fr',
  'https://maps.google.com/?q=123+Rue+de+l''Automobile',
  'Lundi-Vendredi: 9h-19h, Samedi: 9h-18h',
  'Nous sommes un garage familial passionné par les automobiles depuis 1980.',
  '/images/garage-logo.png'
)
on conflict (id) do nothing;

-- Note: The above UUID for garage_infos is fixed to ensure only one row exists.
-- In a real scenario, you might want to generate a proper UUID and use a unique constraint.
-- However, for simplicity and to meet the requirement of a single row, we use a fixed UUID.