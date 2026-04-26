import { RequestStatus, RequestType } from "@/types/enums";

export interface CreateRequestDTO {
  userId: string;
  requestType: RequestType;
  listingId?: string | null;
  oldCity?: string | null;
  newCity?: string | null;
}

export interface ReviewRequestDTO {
  requestId: number;
  decision: RequestStatus;
}
