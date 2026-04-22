/**
 * Maps audit action types to user-friendly labels and identifying colours
 */

type ActionDisplay = {
  label: string;
  color: string;
};

const ACTION_LABELS: Record<string, ActionDisplay> = {
  SIGN_UP_REQUESTED: { label: "Sign Up Requested", color: "#93c5fd" },
  SIGN_UP_APPROVED: { label: "Sign Up Approved", color: "#4ade80" },
  SIGN_UP_DENIED: { label: "Sign Up Denied", color: "#f87171" },
  CITY_CHANGE_REQUESTED: { label: "City Change Requested", color: "#93c5fd" },
  CITY_CHANGE_APPROVED: { label: "City Change Approved", color: "#4ade80" },
  CITY_CHANGE_DENIED: { label: "City Change Denied", color: "#f87171" },
  CITY_CHANGED: { label: "City Changed", color: "#4ade80" },
  LISTING_UPLOAD_REQUESTED: { label: "Listing Upload Requested", color: "#93c5fd" },
  LISTING_UPLOAD_APPROVED: { label: "Listing Upload Approved", color: "#4ade80" },
  LISTING_UPLOAD_DENIED: { label: "Listing Upload Denied", color: "#f87171" },
  USER_APPROVED: { label: "User Approved", color: "#4ade80" },
  USER_DENIED: { label: "User Denied", color: "#f87171" },
  USER_BANNED: { label: "User Banned", color: "#f87171" },
  MESSAGE_DELETED: { label: "Message Deleted", color: "#fbbf24" },
};

export function getAuditActionDisplay(actionType: string): ActionDisplay {
  return ACTION_LABELS[actionType] ?? { label: actionType, color: "#ccff00" };
}
