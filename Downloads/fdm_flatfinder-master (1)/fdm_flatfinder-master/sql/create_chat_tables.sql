-- ============================================================
-- FDM Flatfinder — full SQL migration
-- Run this in your Supabase SQL editor
-- ============================================================

-- ── 1. Add isApproved column to Listings ──────────────────────
ALTER TABLE "Listings"
  ADD COLUMN IF NOT EXISTS "isApproved" boolean NOT NULL DEFAULT false;

-- ── 2. Favourites table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Favourites" (
  id         serial PRIMARY KEY,
  "userId"   uuid NOT NULL REFERENCES "Users"("userId") ON DELETE CASCADE,
  "listingId" integer NOT NULL REFERENCES "Listings"(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE ("userId", "listingId")
);

CREATE INDEX IF NOT EXISTS favourites_user_idx    ON "Favourites"("userId");
CREATE INDEX IF NOT EXISTS favourites_listing_idx ON "Favourites"("listingId");

ALTER TABLE "Favourites" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own favourites" ON "Favourites";
CREATE POLICY "Users can manage their own favourites"
  ON "Favourites" FOR ALL
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

-- ── 3. Conversations table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Conversations" (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id        uuid NOT NULL REFERENCES "Users"("userId") ON DELETE CASCADE,
  user2_id        uuid NOT NULL REFERENCES "Users"("userId") ON DELETE CASCADE,
  listing_id      integer REFERENCES "Listings"(id) ON DELETE SET NULL,
  last_message    text,
  last_message_at timestamptz DEFAULT now() NOT NULL,
  created_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS conversations_user1_idx ON "Conversations"(user1_id);
CREATE INDEX IF NOT EXISTS conversations_user2_idx ON "Conversations"(user2_id);

ALTER TABLE "Conversations" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their conversations" ON "Conversations";
DROP POLICY IF EXISTS "Users can create conversations" ON "Conversations";
DROP POLICY IF EXISTS "Users can update their conversations" ON "Conversations";

CREATE POLICY "Users can view their conversations"
  ON "Conversations" FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations"
  ON "Conversations" FOR INSERT
  WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update their conversations"
  ON "Conversations" FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ── 4. Messages table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Messages" (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES "Conversations"(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES "Users"("userId") ON DELETE CASCADE,
  content         text NOT NULL,
  created_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx ON "Messages"(conversation_id);

ALTER TABLE "Messages" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON "Messages";
DROP POLICY IF EXISTS "Users can send messages" ON "Messages";

CREATE POLICY "Users can view messages in their conversations"
  ON "Messages" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Conversations"
      WHERE id = conversation_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

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

-- ── 5. Enable realtime for live chat ───────────────────────────
-- Go to Supabase Dashboard → Database → Replication
-- and add the "Messages" table to supabase_realtime publication.
-- Or uncomment the line below:
-- ALTER PUBLICATION supabase_realtime ADD TABLE "Messages";
