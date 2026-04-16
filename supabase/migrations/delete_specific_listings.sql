-- Run this in your Supabase SQL Editor to clean up unwanted flats
DELETE FROM "Listings" 
WHERE "id" IN (46, 64, 65, 70);

-- Note: Because we used ON DELETE CASCADE when setting up the database, 
-- deleting these listings will naturally also delete any associated 
-- ListingLocations and UserFavourites automatically!
