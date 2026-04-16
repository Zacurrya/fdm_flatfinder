-- Run this in your Supabase SQL editor to enable the chat feature.

-- Conversations table: one row per unique pair of users (optionally linked to a listing)
CREATE TABLE IF NOT EXISTS "Conversations" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id uuid NOT NULL REFERENCES "Users"("userId") ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES "Users"("userId") ON DELETE CASCADE,
  listing_id integer REFERENCES "Listings"(id) ON DELETE SET NULL,
  last_message text,
  last_message_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Messages table: all messages within a conversation
CREATE TABLE IF NOT EXISTS "Messages" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES "Conversations"(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES "Users"("userId") ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS conversations_user1_idx ON "Conversations"(user1_id);
CREATE INDEX IF NOT EXISTS conversations_user2_idx ON "Conversations"(user2_id);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON "Messages"(conversation_id);

-- Enable Row Level Security
ALTER TABLE "Conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Messages" ENABLE ROW LEVEL SECURITY;

-- RLS: users can only see conversations they are part of
CREATE POLICY "Users can view their conversations"
  ON "Conversations" FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS: users can create conversations where they are user1
CREATE POLICY "Users can create conversations"
  ON "Conversations" FOR INSERT
  WITH CHECK (auth.uid() = user1_id);

-- RLS: users can update conversations they are part of (for last_message)
CREATE POLICY "Users can update their conversations"
  ON "Conversations" FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS: users can read messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON "Messages" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Conversations"
      WHERE id = conversation_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- RLS: users can only send messages as themselves in their conversations
CREATE POLICY "Users can send messages"
  ON "Messages" FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM "Conversations"
      WHERE id = conversation_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Enable realtime for live message updates (run in Supabase dashboard > Database > Replication)
-- Or uncomment and run:
-- ALTER PUBLICATION supabase_realtime ADD TABLE "Messages";
