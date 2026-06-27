-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  bio text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Posts table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  image_url text not null,
  film_name text,
  camera text,
  lens text,
  created_at timestamptz default now() not null
);

-- Reposts table
create table public.reposts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, post_id)
);

-- Follows table
create table public.follows (
  follower_id uuid references public.users(id) on delete cascade not null,
  following_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.reposts enable row level security;
alter table public.follows enable row level security;

-- Users policies
create policy "Users are viewable by everyone" on public.users
  for select using (true);

create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Posts policies
create policy "Posts are viewable by everyone" on public.posts
  for select using (true);

create policy "Authenticated users can create posts" on public.posts
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own posts" on public.posts
  for delete using (auth.uid() = user_id);

-- Reposts policies
create policy "Reposts are viewable by everyone" on public.reposts
  for select using (true);

create policy "Authenticated users can repost" on public.reposts
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own reposts" on public.reposts
  for delete using (auth.uid() = user_id);

-- Follows policies
create policy "Follows are viewable by everyone" on public.follows
  for select using (true);

create policy "Authenticated users can follow" on public.follows
  for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow" on public.follows
  for delete using (auth.uid() = follower_id);

-- Storage bucket for images
insert into storage.buckets (id, name, public) values ('post-images', 'post-images', true);
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Storage policies
create policy "Post images are publicly accessible" on storage.objects
  for select using (bucket_id = 'post-images');

create policy "Authenticated users can upload post images" on storage.objects
  for insert with check (bucket_id = 'post-images' and auth.role() = 'authenticated');

create policy "Avatars are publicly accessible" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update their own avatars" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
