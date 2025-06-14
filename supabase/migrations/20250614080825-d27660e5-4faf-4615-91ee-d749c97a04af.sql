
-- Create storage bucket for task images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('task-images', 'task-images', true)
ON CONFLICT (id) DO NOTHING;
