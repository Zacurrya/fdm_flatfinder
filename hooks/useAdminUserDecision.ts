import { User } from "@services/auth/types";
import * as AuthController from "@services/auth/authController";
import { useAudit } from "@hooks/useAudit";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

type DecisionAction = "approve" | "reject";

type UseAdminUserDecisionOptions = {
  onSuccess?: (pendingUser: User, action: DecisionAction) => void;
};

export default function useAdminUserDecision({
  onSuccess,
}: UseAdminUserDecisionOptions = {}) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { logAction } = useAudit();

  const handleDecision = useCallback(
    (pendingUser: User, action: DecisionAction) => {
      const isApprove = action === "approve";
      const actionLabel = isApprove ? "Approve" : "Reject";

      Alert.alert(
        `${actionLabel} User`,
        `Are you sure you want to ${action} ${pendingUser.firstName} ${pendingUser.lastName}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: actionLabel,
            style: isApprove ? "default" : "destructive",
            onPress: async () => {
              setProcessingId(pendingUser.userId);
              const result = isApprove
                ? await AuthController.approveUser({ userId: pendingUser.userId })
                : await AuthController.rejectUser({ userId: pendingUser.userId });
              setProcessingId(null);

              if (result.success) {
                const auditResult = await logAction(
                  isApprove ? "USER_APPROVED" : "USER_DENIED",
                  pendingUser.userId
                );

                if (!auditResult.success) {
                  console.warn(`Audit log failed for ${action}:`, auditResult.error);
                }

                onSuccess?.(pendingUser, action);
              } else {
                Alert.alert("Error", result.error ?? `Failed to ${action} user.`);
              }
            },
          },
        ]
      );
    },
    [onSuccess]
  );

  const approveUser = useCallback(
    (pendingUser: User) => handleDecision(pendingUser, "approve"),
    [handleDecision]
  );

  const rejectUser = useCallback(
    (pendingUser: User) => handleDecision(pendingUser, "reject"),
    [handleDecision]
  );

  return {
    processingId,
    approveUser,
    rejectUser,
  };
}
