import { ActionType, ApprovalStatus, ListingStatus, PropertyType, RentPeriod, RequestStatus, RequestType, Role } from "@/types/enums";

export type ListingRecord = {
    id: string;
    ownerId: string;
    title: string;
    description: string;
    price: number;
    rentPeriod: RentPeriod;
    locationId: string;
    mediaUrls: string[];
    source: string;
    bedrooms: number;
    bathrooms: number;
    propertyType: PropertyType;
    status: ListingStatus;
    createdAt: string;
    updatedAt: string;
}

export type AuditLogRecord = {
    id: string;
    userId: string;
    targetId: string;
    actionType: ActionType;
    createdAt: string;
}

export type RequestRecord = {
    id: number;
    userId: string;
    requestType: RequestType;
    status: RequestStatus;
    listingId: string | null;
    oldCity: string | null;
    newCity: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    createdAt: string;
};

export type UserRecord = {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    officeLocation: string;
    phoneNumber: string;
    role: Role;
    avatarUrl: string | null;
    approvalStatus: ApprovalStatus;
    createdAt: string;
};

export type ChatRecord = {
    id: string;
    chat_name: string;
    last_message: string;
    last_message_at: string;
    created_at: string;
    listing_id: string | null;
}

export type MessageRecord = {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    createdAt: string;
};