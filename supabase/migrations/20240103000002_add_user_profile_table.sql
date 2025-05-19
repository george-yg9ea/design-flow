-- Create user_profile table
create table public.user_profile (
    id uuid references auth.users(id) on delete cascade primary key,
    name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS policies
alter table public.user_profile enable row level security;

-- Users can read any profile
create policy "Users can view any profile"
    on public.user_profile for select
    using (true);

-- Users can only update their own profile
create policy "Users can update their own profile"
    on public.user_profile for update
    using (id = auth.uid());

-- Users can insert their own profile
create policy "Users can insert their own profile"
    on public.user_profile for insert
    with check (id = auth.uid());

-- Grant permissions
grant select on public.user_profile to authenticated;
grant insert, update on public.user_profile to authenticated;

-- Update user_profiles view to include name
create or replace view public.user_profiles as
select u.id, u.email, p.name
from auth.users u
left join public.user_profile p on u.id = p.id;

-- Add trigger to automatically create profile on user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.user_profile (id)
    values (new.id);
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user(); 