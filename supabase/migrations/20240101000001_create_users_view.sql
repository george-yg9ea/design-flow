-- Create a view to safely expose user emails
create or replace view public.user_profiles as
select id, email
from auth.users;

-- Grant access to the view
grant select on public.user_profiles to authenticated; 