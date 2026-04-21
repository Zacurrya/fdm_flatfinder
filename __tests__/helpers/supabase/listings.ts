import { createChainableSupabaseMock, createResolvedMock } from "./base";

// Creates a standard mock for the Listings table
export const mockListingsTable = (data: any | any[] = []) => {
  const resolved = { data: data, error: null };
  return {
    ...createChainableSupabaseMock(resolved),
    single: createResolvedMock(resolved),
  };
};
