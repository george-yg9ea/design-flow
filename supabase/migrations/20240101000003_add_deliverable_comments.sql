-- Create deliverable_comments table
create table public.deliverable_comments (
    id uuid default gen_random_uuid() primary key,
    project_deliverable_id uuid references public.project_deliverables(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS policies
alter table public.deliverable_comments enable row level security;

create policy "Users can view comments if they can view the project"
    on public.deliverable_comments for select
    using (
        exists (
            select 1
            from public.project_deliverables pd
            join public.projects p on p.id = pd.project_id
            where pd.id = deliverable_comments.project_deliverable_id
            and p.created_by = auth.uid()
        )
    );

create policy "Users can create comments if they can view the project"
    on public.deliverable_comments for insert
    with check (
        exists (
            select 1
            from public.project_deliverables pd
            join public.projects p on p.id = pd.project_id
            where pd.id = project_deliverable_id
            and p.created_by = auth.uid()
        )
    );

create policy "Users can update their own comments"
    on public.deliverable_comments for update
    using (user_id = auth.uid());

create policy "Users can delete their own comments"
    on public.deliverable_comments for delete
    using (user_id = auth.uid());

-- Create indexes
create index deliverable_comments_project_deliverable_id_idx on public.deliverable_comments(project_deliverable_id);
create index deliverable_comments_created_at_idx on public.deliverable_comments(created_at);

-- Grant permissions
grant select, insert, update, delete on public.deliverable_comments to authenticated; 