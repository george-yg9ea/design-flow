-- Create project_updates table
create table public.project_updates (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable realtime for project_updates
alter publication supabase_realtime add table project_updates;

-- Set up RLS policies
alter table public.project_updates enable row level security;

create policy "Users can view project updates if they own the project"
    on public.project_updates for select
    using (
        exists (
            select 1
            from public.projects
            where id = project_updates.project_id
            and created_by = auth.uid()
        )
    );

create policy "Users can create updates for projects they own"
    on public.project_updates for insert
    with check (
        exists (
            select 1
            from public.projects
            where id = project_updates.project_id
            and created_by = auth.uid()
        )
    );

-- Create indexes
create index project_updates_project_id_idx on public.project_updates(project_id);
create index project_updates_created_at_idx on public.project_updates(created_at desc);

-- Grant necessary permissions
grant select on auth.users to authenticated;
grant select on public.project_updates to authenticated;
grant insert on public.project_updates to authenticated; 