import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { supabase } from "@lib/supabase";
import { mockListingDTO } from "@mocks/data/dtos/listingDTO.json";
import { mockListingRow } from "@mocks/data/entities/listings.json";
import { deleteListing, fetchListingById, fetchListings } from "@services/listings/listingsService";
import { createChainableSupabaseMock, mockListingsTable, resetSupabaseMock } from "../helpers/supabase";

jest.mock("@lib/supabase");

beforeEach(() => {
  resetSupabaseMock();
});

describe("listingsService", () => {
  describe("fetchListings", () => {
    test("fetches all approved listings", async () => {
      const listingsMock = mockListingsTable([mockListingRow]);

      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Listings") return listingsMock;
        return {};
      });

      const result = await fetchListings();

      expect(supabase.from).toHaveBeenCalledWith("Listings");
      expect(listingsMock.eq).toHaveBeenCalledWith("approvalStatus", "APPROVED");
      expect(result).toEqual([mockListingRow]);
    });
  });

  describe("fetchListingById", () => {
    test("fetches a single approved listing", async () => {
      const listingsMock = mockListingsTable(mockListingRow);
      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "Listings") return listingsMock;
        return {};
      });

      const result = await fetchListingById(mockListingDTO.listingId);

      expect(result).toEqual(mockListingRow);
    });
  });

  describe("deleteListing", () => {
    test("deletes favourites then listing", async () => {
      const favouritesMock = createChainableSupabaseMock({ error: null });
      const listingsMock = createChainableSupabaseMock({ error: null });

      (supabase.from as jest.Mock).mockImplementation((...args: unknown[]) => {
        const table = args[0] as string;
        if (table === "UserFavourites") return favouritesMock;
        if (table === "Listings") return listingsMock;
        return {};
      });

      await deleteListing(mockListingDTO.listingId);

      expect(favouritesMock.delete).toHaveBeenCalled();
      expect(listingsMock.delete).toHaveBeenCalled();
    });
  });
});
