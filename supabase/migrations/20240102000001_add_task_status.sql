BEGIN;

-- Add status column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN status TEXT NOT NULL DEFAULT 'todo' 
CHECK (status IN ('todo', 'in_progress', 'done'));

-- Update existing records to have a default status
UPDATE public.tasks SET status = 'todo' WHERE status IS NULL;

-- Create index for status column for better query performance
CREATE INDEX tasks_status_idx ON public.tasks(status);

-- Update any tasks that might have invalid status values
UPDATE public.tasks 
SET status = 'todo' 
WHERE status NOT IN ('todo', 'in_progress', 'done');

COMMIT; 