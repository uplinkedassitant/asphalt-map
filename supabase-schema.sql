-- Run this in Supabase SQL Editor to create the table

create table asphalt_plants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  latitude numeric not null,
  longitude numeric not null,
  services jsonb not null default '[]'::jsonb,
  -- e.g. ["Hot Mix", "Cold Patch", "Recycled Asphalt"]
  hours jsonb not null,
  -- e.g. { "monday": {"open":"06:00","close":"17:00"}, "sunday": {"closed":true,"open":"","close":""} }
  phone text,
  notes text,
  created_at timestamp with time zone default now()
);

-- Allow public read access (no auth needed for the map)
alter table asphalt_plants enable row level security;

create policy "Public read access"
  on asphalt_plants
  for select
  to anon
  using (true);

-- Example row to test with
insert into asphalt_plants (name, address, latitude, longitude, services, hours, phone, notes)
values (
  'Metro Asphalt – Central',
  '1200 Industrial Blvd, Springfield, IL 62701',
  39.7817,
  -89.6501,
  '["Hot Mix", "Cold Patch", "Recycled Asphalt"]',
  '{
    "monday":    {"open":"06:00","close":"17:00"},
    "tuesday":   {"open":"06:00","close":"17:00"},
    "wednesday": {"open":"06:00","close":"17:00"},
    "thursday":  {"open":"06:00","close":"17:00"},
    "friday":    {"open":"06:00","close":"17:00"},
    "saturday":  {"open":"07:00","close":"13:00"},
    "sunday":    {"closed":true,"open":"","close":""}
  }',
  '217-555-0101',
  'Call ahead for large orders.'
);
