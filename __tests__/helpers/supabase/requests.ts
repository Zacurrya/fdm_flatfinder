import { createChainableSupabaseMock, createResolvedMock } from "./base";

// Request and Audit Table Mocking

/**
 * Creates a standard mock for the Requests table
 */
export const mockRequestsTable = (data: any | any[] = []) => {
  const resolved = { data: data, error: null };
  return {
    ...createChainableSupabaseMock(resolved),
    single: createResolvedMock(resolved),
    maybeSingle: createResolvedMock(resolved),
  };
};

/**
 * Creates a standard mock for the AuditLogs table
 */
export const mockAuditLogsTable = (data: any | any[] = []) => {
  const resolved = { data: data, error: null };
  return {
    ...createChainableSupabaseMock(resolved),
  };
};
