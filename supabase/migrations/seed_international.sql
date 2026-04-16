-- ============================================================
-- FDM FlatFinder: Seed International Script
-- Run this entire file in the Supabase SQL Editor
-- This script seeds listings using the ListingLocations table
-- Features full descriptions and high-quality photography
-- ============================================================

DO $$
DECLARE
  seed_user_id UUID;
  new_listing_id BIGINT;
BEGIN
  -- Grab the first approved user to act as listing owner for seeded data
  SELECT "userId" INTO seed_user_id
  FROM "Users"
  WHERE "approvalStatus" = 'APPROVED'
  LIMIT 1;

  IF seed_user_id IS NULL THEN
    RAISE EXCEPTION 'No approved user found.';
  END IF;

  -- ── SINGAPORE LISTINGS ──────────────────────────────────────
  -- 1. The Sail @ Marina Bay
  INSERT INTO "Listings" ("title", "description", "price", "rentPeriod", "propertyType", "beds", "baths", "source", "photos", "userId")
  VALUES (
    'The Sail @ Marina Bay Luxury Condo', 
    'Experience the pinnacle of waterfront living in this luxurious 2-bedroom condominium at The Sail @ Marina Bay. Featuring floor-to-ceiling windows with panoramic views of the iconic Marina Bay Sands and the Singapore skyline. The building features world-class amenities including a lap pool, tennis courts, and direct underground access to Raffles Place MRT.', 
    6500, 'MONTHLY', 'FLAT', 2, 2, 'FDM', 
    ARRAY[
      'https://images.unsplash.com/photo-1545042746-d8f1e5699c64?w=800',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800'
    ], 
    seed_user_id
  )
  RETURNING id INTO new_listing_id;
  
  INSERT INTO "ListingLocations" ("listingId", "city", "address") 
  VALUES (new_listing_id, 'Singapore', '2 Marina Blvd, #30-01');

  -- 2. Tiong Bahru Art Deco Walk-Up
  INSERT INTO "Listings" ("title", "description", "price", "rentPeriod", "propertyType", "beds", "baths", "source", "photos", "userId")
  VALUES (
    'Tiong Bahru Art Deco Walk-Up', 
    'A rare gem in the heritage enclave of Tiong Bahru. This spacious, renovated walk-up apartment retains its historical 1930s Art Deco charm while boasting a stunning contemporary interior design. Located just steps away from famous heritage bakeries, hip cafes, and the Tiong Bahru market. Perfect for young professionals who appreciate character and location.', 
    4200, 'MONTHLY', 'FLAT', 2, 1, 'RIGHTMOVE', 
    ARRAY[
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    ], 
    seed_user_id
  )
  RETURNING id INTO new_listing_id;
  
  INSERT INTO "ListingLocations" ("listingId", "city", "address") 
  VALUES (new_listing_id, 'Singapore', 'Tiong Bahru Road, Block 55');

  -- ── LONDON LISTINGS ─────────────────────────────────────────
  -- 1. Canary Wharf Penthouse
  INSERT INTO "Listings" ("title", "description", "price", "rentPeriod", "propertyType", "beds", "baths", "source", "photos", "userId")
  VALUES (
    'Luxury Canary Wharf Penthouse', 
    'An immaculate three-bedroom penthouse located right in the bustling heart of Canary Wharf. The property spans over 2,000 square feet, offering breathtaking, uninterrupted views over the River Thames and the City of London. It boasts a designer open-plan kitchen, state-of-the-art climate control, a 24-hour concierge, and secure underground parking. Ideal for FDM consultants working locally.', 
    3500, 'MONTHLY', 'FLAT', 3, 2, 'FDM', 
    ARRAY[
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687920-4e2a09be15c7?w=800'
    ], 
    seed_user_id
  )
  RETURNING id INTO new_listing_id;
  
  INSERT INTO "ListingLocations" ("listingId", "city", "address") 
  VALUES (new_listing_id, 'London', '10 Canada Square, London E14 5AB');

  -- 2. Notting Hill Studio
  INSERT INTO "Listings" ("title", "description", "price", "rentPeriod", "propertyType", "beds", "baths", "source", "photos", "userId")
  VALUES (
    'Cozy Notting Hill Studio', 
    'A delightfully cozy and bright studio apartment nestled on the world-famous Portobello Road in Notting Hill. Recently refurbished to a high standard, this studio cleverly maximizes space with built-in storage, a hidden fold-out bed, and a modern kitchenette. Step out your front door onto a vibrant street full of antique markets, vintage shops, and lively cafes.', 
    1800, 'MONTHLY', 'STUDIO', 1, 1, 'ZOOPLA', 
    ARRAY[
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800'
    ], 
    seed_user_id
  )
  RETURNING id INTO new_listing_id;
  
  INSERT INTO "ListingLocations" ("listingId", "city", "address") 
  VALUES (new_listing_id, 'London', 'Portobello Road, London W11');

  -- ── HONG KONG LISTINGS ──────────────────────────────────────
  -- 1. Mid-Levels Highrise
  INSERT INTO "Listings" ("title", "description", "price", "rentPeriod", "propertyType", "beds", "baths", "source", "photos", "userId")
  VALUES (
    'Mid-Levels Highrise Apartment', 
    'Enjoy elevated living in this prestigious Robinson Road apartment situated in the highly exclusive Mid-Levels district. Boasting expansive views of Victoria Harbour and lush mountain greenery. This bright 2-bedroom unit features an ultra-modern kitchen, smart-home integration, and direct access to the Mid-Levels escalator for an effortless morning commute to Central.', 
    45000, 'MONTHLY', 'FLAT', 2, 2, 'OPENRENT', 
    ARRAY[
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
    ], 
    seed_user_id
  )
  RETURNING id INTO new_listing_id;
  
  INSERT INTO "ListingLocations" ("listingId", "city", "address") 
  VALUES (new_listing_id, 'Hong Kong', '10 Robinson Road, Mid-Levels');

  -- 2. Wan Chai Studio
  INSERT INTO "Listings" ("title", "description", "price", "rentPeriod", "propertyType", "beds", "baths", "source", "photos", "userId")
  VALUES (
    'Wan Chai Renovated Studio', 
    'A sleek, minimalist renovated studio apartment located right in the beating heart of Wan Chai. Perfectly designed for the busy expatriate, it offers an efficient layout with custom wooden cabinetry, a modern rain shower, and huge windows that flood the apartment with natural light during the day, framing the dazzling city neon at night. Unbeatable dining and transport right on your doorstep.', 
    18000, 'MONTHLY', 'STUDIO', 1, 1, 'FDM', 
    ARRAY[
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800'
    ], 
    seed_user_id
  )
  RETURNING id INTO new_listing_id;
  
  INSERT INTO "ListingLocations" ("listingId", "city", "address") 
  VALUES (new_listing_id, 'Hong Kong', 'Johnston Road, Wan Chai');

  RAISE NOTICE 'Seeded Detailed International listings!';
END $$;
