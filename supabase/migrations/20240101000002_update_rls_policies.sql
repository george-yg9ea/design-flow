-- Add update and delete policies for project updates
create policy "Users can update their own updates"
    on public.project_updates for update
    using (user_id = auth.uid());

create policy "Users can delete their own updates"
    on public.project_updates for delete
    using (user_id = auth.uid());

-- Grant additional permissions
grant update, delete on public.project_updates to authenticated; 