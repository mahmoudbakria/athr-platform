-- PAGES MIGRATION
-- Creates a table for dynamic static pages content.

create table if not exists public.pages (
  slug text primary key,
  title text not null,
  content text,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.pages enable row level security;

-- Policies
drop policy if exists "Pages are viewable by everyone" on public.pages;
create policy "Pages are viewable by everyone"
  on public.pages for select
  using ( true );

drop policy if exists "Admins/Mods can manage pages" on public.pages;
create policy "Admins/Mods can manage pages"
  on public.pages for all
  using ( public.is_admin_or_mod() );

-- Seed Data (Initial Content)
insert into public.pages (slug, title, content) values
  ('about', 'About Us', '<h1>About Antigravity</h1><p>We are a community-driven marketplace dedicated to bridging the gap between those who have and those in need.</p>'),
  ('how-it-works', 'How it Works', '<h1>How it Works</h1><p>1. <strong>Donate:</strong> Post your items.<br>2. <strong>Connect:</strong> Chat with people who need them.<br>3. <strong>Give:</strong> Meet up and share the good.</p>'),
  ('impact', 'Our Impact', '<h1>Our Impact</h1><p>Together we have facilitated thousands of exchanges, reducing waste and helping families.</p>'),
  ('contact', 'Contact Us', '<h1>Contact Us</h1><p>Email us at: <strong>support@antigravity.com</strong></p>'),
  ('privacy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>Your privacy is important to us...</p>'),
  ('terms', 'Terms of Service', '<h1>Terms of Service</h1><p>By using this platform, you agree to...</p>'),
  ('cookies', 'Cookie Policy', '<h1>Cookie Policy</h1><p>We use cookies to improve your experience.</p>')
on conflict (slug) do nothing;
