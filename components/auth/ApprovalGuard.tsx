import AwaitingApprovalView from "@components/ui/AwaitingApprovalView";
import { useAuth } from "@hooks/useAuth";

type ApprovalGuardProps = {
  children: React.ReactNode;
};

/**
 * Guards unauthorised access to the app until the user's account is approved by an admin.
 */
const ApprovalGuard = ({ children }: ApprovalGuardProps) => {
  const { user } = useAuth();

  if (user?.approvalStatus === "PENDING" || user?.approvalStatus === "REJECTED") {
    return (
      <AwaitingApprovalView
        title={user.approvalStatus === "REJECTED" ? "Account Denied" : "Awaiting Approval"}
      />
    );
  }

  return <>{children}</>;
};

export default ApprovalGuard;
