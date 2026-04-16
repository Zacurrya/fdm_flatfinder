import { supabase } from "@lib/supabase";

type UserEmailMapResult = {
  success: boolean;
  data?: Record<string, string>;
  error?: string;
};

export const getUserEmailMapByIds = async (
  userIds: string[]
): Promise<UserEmailMapResult> => {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

  if (uniqueUserIds.length === 0) {
    return { success: true, data: {} };
  }

  const { data, error } = await supabase
    .from("Users")
    .select("userId, email")
    .in("userId", uniqueUserIds);

  if (error) {
    return { success: false, error: error.message };
  }

  const emailMap = Object.fromEntries(
    (data ?? []).map((row) => [row.userId, row.email ?? ""])
  );

  return { success: true, data: emailMap };
};

{/* PUSH */}