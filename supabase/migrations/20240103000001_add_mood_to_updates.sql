-- Add mood column with proper constraints
alter table project_updates
add column mood text not null default 'good'
check (mood in ('not_great', 'okay', 'good', 'great'));

-- Set default mood for existing updates
update project_updates set mood = 'good' where mood is null; 