import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockListingRow } from "@mocks/data/listings.json";
import { deleteListing, fetchListingById, fetchListings } from "@services/listings/listingsService";
import { resetSupabaseMock } from "../helpers/supabaseMock";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("listingsService", () => {
  describe("fetchListings", () => {
    test("fetches all approved listings", async () => {
      const listingsMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [mockListingRow], error: null }),
      };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Listings") return listingsMock;
        return {};
      });

      const result = await fetchListings();

      expect(supabase.from).toHaveBeenCalledWith("Listings");
      expect(result).toEqual([mockListingRow]);
    });
  });

  describe("fetchListingById", () => {
    test("fetches a single approved listing", async () => {
      const listingsMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockListingRow, error: null }),
      };
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "Listings") return listingsMock;
        return {};
      });

      const result = await fetchListingById(1);

      expect(result).toEqual(mockListingRow);
    });
  });

  describe("deleteListing", () => {
    test("deletes favourites then listing", async () => {
      const favouritesMock = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      const listingsMock = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "UserFavourites") return favouritesMock;
        if (table === "Listings") return listingsMock;
        return {};
      });

      await deleteListing(1);

      expect(favouritesMock.delete).toHaveBeenCalled();
      expect(listingsMock.delete).toHaveBeenCalled();
    });
  });
});
