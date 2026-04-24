import { AdminRequest } from "@/types/views";

export type RequestCardProps = {
    request: AdminRequest;
    isProcessing: boolean;
    onApprove: (request: AdminRequest) => void;
    onReject: (request: AdminRequest) => void;
};
