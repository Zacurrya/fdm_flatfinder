import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import FDMLoader from "@components/ui/FDMLoader";
import { Text, TouchableOpacity, View } from "react-native";

type ProfilePicProps = {
  avatarUrl: string | null;
  initials: string;
  size?: number;
  onPress?: () => void;
  isUploading?: boolean;
  showEditIcon?: boolean;
};

const ProfilePic = ({
  avatarUrl,
  initials,
  size = 64,
  onPress,
  isUploading = false,
  showEditIcon = false,
}: ProfilePicProps) => {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const Content = (
    <View
      style={containerStyle}
      className="bg-fdm-accent/20 border border-fdm-accent/30 items-center justify-center overflow-hidden"
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <Text
          style={{ fontSize: size * 0.4 }}
          className="text-fdm-accent font-bold"
        >
          {initials}
        </Text>
      )}

      {/* Uploading Overlay */}
      {isUploading && (
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
