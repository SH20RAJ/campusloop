-- 0003: student social / coding / creative / professional links on profiles.
-- Idempotent: safe to run multiple times.
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{"platforms":{},"custom":[]}'::jsonb;

UPDATE user_profiles
  SET social_links = '{"platforms":{},"custom":[]}'::jsonb
  WHERE social_links IS NULL;
