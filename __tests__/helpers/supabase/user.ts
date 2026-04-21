import { mockUser } from "@mocks/data/entities/users.json";
import { createChainableSupabaseMock, createResolvedMock } from "./base";

export { asAsyncMock } from "./base";

// User Table Mocking

/**
 * Creates a standard mock for the Users table
 */
export const mockUsersTable = (data: any | any[] = mockUser) => {
  const resolved = { data: data, error: null };
  return {
    ...createChainableSupabaseMock(resolved),
    single: createResolvedMock(resolved),
    maybeSingle: createResolvedMock(resolved),
  };
};

/**
 * Creates a standard mock for the UserFavourites table
 */
export const mockUserFavouritesTable = (data: any | any[] = []) => {
  const resolved = { data: data, error: null };
  return {
    ...createChainableSupabaseMock(resolved),
  };
};
