import { createChainableSupabaseMock } from "./base";

// Creates a standard mock for the Conversations table
export const mockConversationsTable = (data: any | any[] = []) => {
  const resolved = { data: data, error: null };
  return {
    ...createChainableSupabaseMock(resolved),
  };
};

// Creates a standard mock for the Messages table
export const mockMessagesTable = (data: any | any[] = []) => {
  const resolved = { data: data, error: null };
  return {
    ...createChainableSupabaseMock(resolved),
  };
};
