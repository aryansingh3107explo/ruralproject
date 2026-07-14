-- Alter complaints table to add tracking and AI fields
ALTER TABLE public.complaints 
ADD COLUMN estimated_completion VARCHAR,
ADD COLUMN officer_assigned VARCHAR DEFAULT 'Unassigned' NOT NULL,
ADD COLUMN progress_percentage INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN ai_detected_issue VARCHAR,
ADD COLUMN ai_confidence INTEGER;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    citizen_name VARCHAR NOT NULL,
    mobile_number VARCHAR NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
