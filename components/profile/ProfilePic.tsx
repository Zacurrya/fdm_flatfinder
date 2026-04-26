import FDMLoader from "@components/ui/FDMLoader";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@hooks/general/useAuth";
import { useProfilePicture } from "@hooks/useProfilePicture";
import { Image } from "expo-image";
import { TouchableOpacity, View } from "react-native";

type ProfilePicProps = {
  avatarUrl?: string | null;
  userId?: string | null;
  size?: number;
  onPress?: () => void;
  isUploading?: boolean;
  showEditIcon?: boolean;
};

const ProfilePic = ({
  avatarUrl: propAvatarUrl,
  userId,
  size = 64,
  onPress,
  isUploading = false,
  showEditIcon = false,
}: ProfilePicProps) => {
  const { user: authUser } = useAuth();

  // If no avatarUrl or userId is provided, we default to the current auth user
  const effectiveUserId = userId === undefined && propAvatarUrl === undefined
    ? authUser?.userId
    : userId;

  const { avatarUrl: hookAvatarUrl, isLoading: hookLoading } = useProfilePicture(effectiveUserId);

  // Use prop URL if provided, otherwise use the one from the hook
  const finalAvatarUrl = propAvatarUrl || hookAvatarUrl;
  const finalIsLoading = isUploading || hookLoading;
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const isSvg = typeof finalAvatarUrl === 'number' || !finalAvatarUrl;

  const Content = (
    <View
      style={containerStyle}
      className="bg-white border border-fdm-accent/30 items-center justify-center overflow-hidden"
    >
      <Image
        source={
          finalAvatarUrl 
            ? (typeof finalAvatarUrl === 'number' ? finalAvatarUrl : { uri: finalAvatarUrl })
            : require("@assets/images/logo.svg")
        }
        style={isSvg ? { width: "75%", height: "75%" } : { width: "100%", height: "100%" }}
        contentFit={isSvg ? "contain" : "cover"}
        transition={200}
        cachePolicy="disk"
        tintColor={!finalAvatarUrl ? "#ccff00" : undefined}
        onError={(e) => console.error(`[ProfilePic] Load failed for: ${finalAvatarUrl}`, e)}
      />

      {finalIsLoading && (
        <View className="absolute inset-0 bg-black/40 items-center justify-center">
          <FDMLoader fullScreen={false} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="relative"
      >
        {Content}
        {showEditIcon && (
          <View className="absolute -bottom-1 -right-1 w-7 h-7 bg-fdm-bg rounded-full items-center justify-center border border-white/5">
            <View className="w-6 h-6 bg-fdm-accent rounded-full items-center justify-center">
              <Ionicons name="camera" size={14} color="#1b1b1b" />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return Content;
};

export default ProfilePic;
