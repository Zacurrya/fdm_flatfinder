import AwaitingApprovalView from "@components/ui/AwaitingApprovalView";
import { useAuth } from "@hooks/useAuth";
import React from "react";

type ApprovalGuardProps = {
  children: React.ReactNode;
};

/**
 * ApprovalGuard
 * Renders AwaitingApprovalView when the current user's account is PENDING
 * or REJECTED, otherwise renders children. Eliminates the repeated
 */
export default function ApprovalGuard({ children }: ApprovalGuardProps) {
  const { user } = useAuth();

  if (user?.approvalStatus === "PENDING" || user?.approvalStatus === "REJECTED") {
    return (
      <AwaitingApprovalView
        title={user.approvalStatus === "REJECTED" ? "Account Denied" : "Awaiting Approval"}
        message={
          user.approvalStatus === "REJECTED"
            ? "Your account has been denied. Please contact an administrator for more information."
            : "Your account is awaiting admin approval."
        }
      />
    );
  }

  return <>{children}</>;
}
