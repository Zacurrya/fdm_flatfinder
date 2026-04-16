/**
 * Listings Seed Script
 *
 * Inserts realistic mock listings from FDM, RightMove, OpenRent, and Zoopla
 * into the Supabase Listings table for dev/demo purposes.
 *
 * Usage:
 *   node scripts/seedListings.mjs
 *
 * Requires:
 *   - EXPO_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local  (or anon key if RLS allows inserts)
 *
 * Note: Run the migration SQL first to add the `source` column.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Read .env.local ---
function loadEnv() {
  const envPath = resolve(__dirname, "../.env.local");
  const raw = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    env[key.trim()] = rest.join("=").trim();
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env["EXPO_PUBLIC_SUPABASE_URL"];
const SUPABASE_KEY =
  env["SUPABASE_SERVICE_ROLE_KEY"] || env["EXPO_PUBLIC_SUPABASE_ANON_KEY"];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or key in .env.local");
  process.exit(1);
}

// ----------------------------------------------------------------
// Mock User ID — replace with a real admin userId from your Users table
// This is used as the "owner" of externally sourced listings
// ----------------------------------------------------------------
const SEED_USER_ID = env["SEED_USER_ID"] || "00000000-0000-0000-0000-000000000000";

// ----------------------------------------------------------------
// Realistic photo URLs from Unsplash (public, no auth required)
// ----------------------------------------------------------------
const photos = {
  flat: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
  ],
  studio: [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800",
  ],
  house: [
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800",
  ],
  modern: [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800",
  ],
};

// ----------------------------------------------------------------
// Seed Listings Data
// ----------------------------------------------------------------
const listings = [
  // ── FDM Internal Listings ──────────────────────────────────────
  {
    title: "Modern City Centre Flat",
    location: "Manchester City Centre, M1",
    price: 950,
    rentPeriod: "MONTHLY",
    propertyType: "FLAT",
    beds: 1,
    baths: 1,
    source: "FDM",
    photos: [photos.flat[0], photos.flat[1]],
  },
  {
    title: "Spacious 2-Bed in Spinningfields",
    location: "Spinningfields, Manchester, M3",
    price: 1400,
    rentPeriod: "MONTHLY",
    propertyType: "FLAT",
    beds: 2,
    baths: 1,
    source: "FDM",
    photos: [photos.modern[0]],
  },
  {
    title: "Cosy Studio Near Piccadilly",
    location: "Piccadilly, Manchester, M1",
    price: 650,
    rentPeriod: "MONTHLY",
    propertyType: "STUDIO",
    beds: 1,
    baths: 1,
    source: "FDM",
    photos: [photos.studio[0]],
  },
  {
    title: "3-Bed Terraced House with Garden",
    location: "Salford, Manchester, M5",
    price: 1650,
    rentPeriod: "MONTHLY",
    propertyType: "TERRACEDHOUSE",
    beds: 3,
    baths: 2,
    source: "FDM",
    photos: [photos.house[0], photos.house[1]],
  },

  // ── RightMove Listings ─────────────────────────────────────────
  {
    title: "Contemporary Flat in Ancoats",
    location: "Ancoats, Manchester, M4",
    price: 1100,
    rentPeriod: "MONTHLY",
    propertyType: "FLAT",
    beds: 1,
    baths: 1,
    source: "RIGHTMOVE",
    photos: [photos.flat[2]],
  },
  {
    title: "Luxury 2-Bed Apartment",
    location: "Deansgate, Manchester, M3",
    price: 1850,
    rentPeriod: "MONTHLY",
    propertyType: "FLAT",
    beds: 2,
    baths: 2,
    source: "RIGHTMOVE",
    photos: [photos.modern[1]],
  },
  {
    title: "Semi-Detached Family Home",
    location: "Didsbury, Manchester, M20",
    price: 2100,
    rentPeriod: "MONTHLY",
    propertyType: "SEMIDETACHED",
    beds: 3,
    baths: 2,
    source: "RIGHTMOVE",
    photos: [photos.house[2]],
  },
  {
    title: "Bright 1-Bed Flat, Pet Friendly",
    location: "Whalley Range, Manchester, M16",
    price: 875,
    rentPeriod: "MONTHLY",
    propertyType: "FLAT",
    beds: 1,
    baths: 1,
    source: "RIGHTMOVE",
    photos: [photos.flat[0]],
  },

  // ── OpenRent Listings ──────────────────────────────────────────
  {
    title: "Affordable Studio, Bills Included",
    location: "Hulme, Manchester, M15",
    price: 580,
    rentPeriod: "MONTHLY",
    propertyType: "STUDIO",
    beds: 1,
    baths: 1,
    source: "OPENRENT",
    photos: [photos.studio[1]],
  },
  {
    title: "Newly Refurbed 2-Bed Flat",
    location: "Chorlton, Manchester, M21",
    price: 1250,
    rentPeriod: "MONTHLY",
    propertyType: "FLAT",
    beds: 2,
    baths: 1,
    source: "OPENRENT",
    photos: [photos.flat[1]],
  },
  {
    title: "Double Room in Shared House",
    location: "Fallowfield, Manchester, M14",
    price: 165,
    rentPeriod: "WEEKLY",
    propertyType: "TERRACEDHOUSE",
    beds: 4,
    baths: 2,
    source: "OPENRENT",
    photos: [photos.house[0]],
  },
  {
    title: "1-Bed Flat, Great Transport Links",
    location: "Rusholme, Manchester, M14",
    price: 800,
    rentPeriod: "MONTHLY",
    propertyType: "FLAT",
    beds: 1,
    baths: 1,
    source: "OPENRENT",
    photos: [photos.modern[0]],
  },

  // ── Zoopla Listings ────────────────────────────────────────────
  {
    title: "Penthouse Studio with City Views",
    location: "Northern Quarter, Manchester, M4",
    price: 1350,
    rentPeriod: "MONTHLY",
    propertyType: "STUDIO",
    beds: 1,
    baths: 1,
    source: "ZOOPLA",
    photos: [photos.studio[0], photos.modern[1]],
  },
  {
    title: "Detached 4-Bed House with Driveway",
    location: "Altrincham, M33",
    price: 2600,
    rentPeriod: "MONTHLY",
    propertyType: "DETACHED",
    beds: 4,
    baths: 3,
    source: "ZOOPLA",
    photos: [photos.house[1], photos.house[2]],
  },
  {
    title: "Stylish 2-Bed Close to MediaCityUK",
    location: "Media City, Salford, M50",
    price: 1550,
    rentPeriod: "MONTHLY",
    propertyType: "FLAT",
    beds: 2,
    baths: 2,
    source: "ZOOPLA",
    photos: [photos.flat[2]],
  },
  {
    title: "Victorian Terrace - Recently Renovated",
    location: "Levenshulme, Manchester, M19",
    price: 1300,
    rentPeriod: "MONTHLY",
    propertyType: "TERRACEDHOUSE",
    beds: 3,
    baths: 1,
    source: "ZOOPLA",
    photos: [photos.house[0]],
  },
];

// ── Insert into Supabase ────────────────────────────────────────
async function seed() {
  console.log(`\n🌱  Seeding ${listings.length} listings into Supabase...\n`);

  let success = 0;
  let failed = 0;

  for (const listing of listings) {
    const payload = {
      ...listing,
      userId: SEED_USER_ID,
      photos: listing.photos,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/Listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`  ✅  [${listing.source}] ${listing.title}`);
      success++;
    } else {
      const err = await res.text();
      console.error(`  ❌  [${listing.source}] ${listing.title}`);
      console.error(`      → ${err}`);
      failed++;
    }
  }

  console.log(`\n📊  Done. ${success} inserted, ${failed} failed.\n`);

  if (failed > 0) {
    console.log("⚠️   If you see RLS errors, either:");
    console.log("    1. Add SUPABASE_SERVICE_ROLE_KEY to .env.local, or");
    console.log("    2. Temporarily disable RLS on the Listings table in Supabase dashboard.");
  }
}

seed().catch(console.error);
