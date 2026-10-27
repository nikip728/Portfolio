-- Create a table for the user profile
create table profiles (
  id uuid default uuid_generate_v4() primary key,
  name text,
  title text,
  bio text,
  email text,
  avatar_url text, -- mapped from avatarUrl
  socials jsonb -- Store socials array as JSONB
);

-- Create a table for technical skills (could be a simple array in profiles, but let's keep it normalized or just use the JSON structure if we want to match the current simple array)
-- To match the current simple `skills: string[]`, we can just add it to profiles.
alter table profiles add column skills text[];

-- Create a table for projects
create table projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  tags text[],
  image_url text, -- mapped from imageUrl
  demo_url text,  -- mapped from demoUrl
  repo_url text,  -- mapped from repoUrl
  relevance_order integer -- to maintain order if needed
);

-- Create a table for experience
create table experience (
  id uuid default uuid_generate_v4() primary key,
  role text not null,
  company text not null,
  period text,
  description text,
  relevance_order integer
);

-- Create a table for education
create table education (
  id uuid default uuid_generate_v4() primary key,
  degree text not null,
  institution text not null,
  year text,
  description text,
  relevance_order integer
);

-- Create a table for certificates
create table certificates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  issuer text,
  date text,
  url text,
  relevance_order integer
);

-- Enable RLS (Row Level Security) - Optional but recommended
alter table profiles enable row level security;
alter table projects enable row level security;
alter table experience enable row level security;
alter table education enable row level security;
alter table certificates enable row level security;

-- Create policy to allow public read access
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Public projects are viewable by everyone" on projects for select using (true);
create policy "Public experience are viewable by everyone" on experience for select using (true);
create policy "Public education are viewable by everyone" on education for select using (true);
create policy "Public certificates are viewable by everyone" on certificates for select using (true);

-- Create policy to allow insert/update for anyone (since we only have a simple admin password client-side, we'll allow public writes for now, or you should setup Auth properly)
-- WARNING: This is insecure for production. Ideally you should use Supabase Auth.
create policy "Allow public insert/update" on profiles for all using (true) with check (true);
create policy "Allow public insert/update" on projects for all using (true) with check (true);
create policy "Allow public insert/update" on experience for all using (true) with check (true);
create policy "Allow public insert/update" on education for all using (true) with check (true);
create policy "Allow public insert/update" on certificates for all using (true) with check (true);
