-- ============================================================
-- FDM FlatFinder: Seed Script
-- Run this entire file in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================

-- Step 1: Add `source` column (safe to re-run)
ALTER TABLE "Listings"
ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'FDM';

ALTER TABLE "Listings"
DROP CONSTRAINT IF EXISTS "Listings_source_check";

ALTER TABLE "Listings"
ADD CONSTRAINT "Listings_source_check"
CHECK ("source" IN ('FDM', 'RIGHTMOVE', 'OPENRENT', 'ZOOPLA'));

-- Step 2: Seed realistic mock listings
-- Replace 'PUT_A_REAL_USER_ID_HERE' with an actual userId from your Users table
-- (e.g. copy one from Dashboard → Table Editor → Users)
DO $$
DECLARE
  seed_user_id UUID;
BEGIN
  -- Grab the first approved user to act as listing owner for seeded data
  SELECT "userId" INTO seed_user_id
  FROM "Users"
  WHERE "approvalStatus" = 'APPROVED'
  LIMIT 1;

  IF seed_user_id IS NULL THEN
    RAISE EXCEPTION 'No approved user found — approve at least one user first, then re-run this script.';
  END IF;

  -- ── FDM Internal Listings ────────────────────────────────
  INSERT INTO "Listings" ("title", "location", "price", "rentPeriod", "propertyType", "beds", "baths", "source", "photos", "userId")
  VALUES
    ('Modern City Centre Flat',
     'Manchester City Centre, M1', 950, 'MONTHLY', 'FLAT', 1, 1, 'FDM',
     ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
           'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
     seed_user_id),

    ('Spacious 2-Bed in Spinningfields',
     'Spinningfields, Manchester, M3', 1400, 'MONTHLY', 'FLAT', 2, 1, 'FDM',
     ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
     seed_user_id),

    ('Cosy Studio Near Piccadilly',
     'Piccadilly, Manchester, M1', 650, 'MONTHLY', 'STUDIO', 1, 1, 'FDM',
     ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
     seed_user_id),

    ('3-Bed Terraced House with Garden',
     'Salford, Manchester, M5', 1650, 'MONTHLY', 'TERRACEDHOUSE', 3, 2, 'FDM',
     ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
           'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
     seed_user_id),

  -- ── RightMove Listings ───────────────────────────────────
    ('Contemporary Flat in Ancoats',
     'Ancoats, Manchester, M4', 1100, 'MONTHLY', 'FLAT', 1, 1, 'RIGHTMOVE',
     ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
     seed_user_id),

    ('Luxury 2-Bed Apartment',
     'Deansgate, Manchester, M3', 1850, 'MONTHLY', 'FLAT', 2, 2, 'RIGHTMOVE',
     ARRAY['https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800'],
     seed_user_id),

    ('Semi-Detached Family Home',
     'Didsbury, Manchester, M20', 2100, 'MONTHLY', 'SEMIDETACHED', 3, 2, 'RIGHTMOVE',
     ARRAY['https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800'],
     seed_user_id),

    ('Bright 1-Bed Flat, Pet Friendly',
     'Whalley Range, Manchester, M16', 875, 'MONTHLY', 'FLAT', 1, 1, 'RIGHTMOVE',
     ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
     seed_user_id),

  -- ── OpenRent Listings ────────────────────────────────────
    ('Affordable Studio, Bills Included',
     'Hulme, Manchester, M15', 580, 'MONTHLY', 'STUDIO', 1, 1, 'OPENRENT',
     ARRAY['https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800'],
     seed_user_id),

    ('Newly Refurbed 2-Bed Flat',
     'Chorlton, Manchester, M21', 1250, 'MONTHLY', 'FLAT', 2, 1, 'OPENRENT',
     ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
     seed_user_id),

    ('Double Room in Shared House',
     'Fallowfield, Manchester, M14', 165, 'WEEKLY', 'TERRACEDHOUSE', 4, 2, 'OPENRENT',
     ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'],
     seed_user_id),

    ('1-Bed Flat, Great Transport Links',
     'Rusholme, Manchester, M14', 800, 'MONTHLY', 'FLAT', 1, 1, 'OPENRENT',
     ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
     seed_user_id),

  -- ── Zoopla Listings ──────────────────────────────────────
    ('Penthouse Studio with City Views',
     'Northern Quarter, Manchester, M4', 1350, 'MONTHLY', 'STUDIO', 1, 1, 'ZOOPLA',
     ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
           'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800'],
     seed_user_id),

    ('Detached 4-Bed House with Driveway',
     'Altrincham, M33', 2600, 'MONTHLY', 'DETACHED', 4, 3, 'ZOOPLA',
     ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
           'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800'],
     seed_user_id),

    ('Stylish 2-Bed Close to MediaCityUK',
     'Media City, Salford, M50', 1550, 'MONTHLY', 'FLAT', 2, 2, 'ZOOPLA',
     ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
     seed_user_id),

    ('Victorian Terrace - Recently Renovated',
     'Levenshulme, Manchester, M19', 1300, 'MONTHLY', 'TERRACEDHOUSE', 3, 1, 'ZOOPLA',
     ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'],
     seed_user_id);

  RAISE NOTICE 'Seeded 16 listings for user %', seed_user_id;
END $$;
