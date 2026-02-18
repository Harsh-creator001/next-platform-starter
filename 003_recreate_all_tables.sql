-- Create contact_messages table to store form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'new' -- new, read, archived
);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to insert messages
CREATE POLICY "Allow service role to insert" ON contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow authenticated users (admin) to view/update their messages
CREATE POLICY "Allow admin to view messages" ON contact_messages
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create index on email for faster queries
CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
