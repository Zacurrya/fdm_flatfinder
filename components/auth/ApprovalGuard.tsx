import AwaitingApprovalView from "@components/auth/AwaitingApprovalView";
import SignOutButton from "@components/profile/SignOutButton";
import FDMLoader from "@components/ui/FDMLoader";
import { useAuth } from "@hooks/general/useAuth";

type ApprovalGuardProps = {
  children: React.ReactNode;
};

/**
 * Guards unauthorised access to the app until the user's account is approved by an admin.
 */
const ApprovalGuard = ({ children }: ApprovalGuardProps) => {
  const { user, isLoading } = useAuth();

  if (user?.approvalStatus === "PENDING" || user?.approvalStatus === "REJECTED") {
    return (
      <>
        {isLoading ? (
          <FDMLoader />
        ) : (
          <>
            <SignOutButton style={{ position: "absolute", top: 40, right: 10, zIndex: 10, opacity: 0.8 }} text={" "} iconSize={30} />
            <AwaitingApprovalView
              title={user.approvalStatus === "REJECTED" ? "Account Denied" : "Awaiting Approval"}
            />
          </>
        )}
      </>
    );
  }

  return <>{children}</>;
};

export default ApprovalGuard;
