import { Image, Text, View } from "react-native";

type MessageAvatarProps = {
  profilePicture?: string | null;
  initials: string;
  visible?: boolean;
};

export default function MessageAvatar({
  profilePicture,
  initials,
  visible = true,
}: MessageAvatarProps) {
  return (
    <View className="w-12 h-12 mr-2">
      {visible ? (
        <View className="w-full h-full rounded-full bg-fdm-accent/20 border border-fdm-accent/30 items-center justify-center overflow-hidden">
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <Text className="text-fdm-accent font-bold text-md">{initials}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}
