-- Add listing approval workflow
-- 1) New request type for listing uploads
-- 2) Listing approval status column
-- 3) Link requests to listing records
-- 4) Audit actions for listing moderation

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'LISTING_UPLOAD'
            AND enumtypid = '"RequestType"'::regtype
    ) THEN
        ALTER TYPE "RequestType" ADD VALUE 'LISTING_UPLOAD';
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'CITY_CHANGED'
            AND enumtypid = '"ActionType"'::regtype
    ) THEN
        ALTER TYPE "ActionType" ADD VALUE 'CITY_CHANGED';
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'LISTING_UPLOAD_REQUESTED'
            AND enumtypid = '"ActionType"'::regtype
    ) THEN
        ALTER TYPE "ActionType" ADD VALUE 'LISTING_UPLOAD_REQUESTED';
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'LISTING_UPLOAD_APPROVED'
            AND enumtypid = '"ActionType"'::regtype
    ) THEN
        ALTER TYPE "ActionType" ADD VALUE 'LISTING_UPLOAD_APPROVED';
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'LISTING_UPLOAD_DENIED'
            AND enumtypid = '"ActionType"'::regtype
    ) THEN
        ALTER TYPE "ActionType" ADD VALUE 'LISTING_UPLOAD_DENIED';
    END IF;
END
$$;

ALTER TABLE "Listings"
ADD COLUMN IF NOT EXISTS "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED';

UPDATE "Listings"
SET "approvalStatus" = 'APPROVED'
WHERE "approvalStatus" IS NULL;

CREATE INDEX IF NOT EXISTS "Listings_approvalStatus_idx"
ON "Listings" ("approvalStatus");

ALTER TABLE "Requests"
ADD COLUMN IF NOT EXISTS "listingId" BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Requests_listingId_fkey'
    ) THEN
        ALTER TABLE "Requests"
        ADD CONSTRAINT "Requests_listingId_fkey"
        FOREIGN KEY ("listingId") REFERENCES "Listings"("id")
        ON DELETE SET NULL;
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "Requests_listingId_idx"
ON "Requests" ("listingId");
