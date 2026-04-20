import { Ionicons } from "@expo/vector-icons";
import { Linking, TouchableOpacity, View } from "react-native";

type ContactActionButtonsProps = {
  phoneNumber?: string | null;
  email?: string | null;
};

export default function ContactActionButtons({
  phoneNumber,
  email,
}: ContactActionButtonsProps) {
  const handleCall = async () => {
    if (!phoneNumber) return;
    await Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = async () => {
    if (!email) return;
    await Linking.openURL(`mailto:${email}`);
  };

  if (!phoneNumber && !email) {
    return null;
  }

  return (
    <View className="flex-row gap-2">
      {phoneNumber && (
        <TouchableOpacity
          onPress={handleCall}
          className="w-9 h-9 rounded-full bg-fdm-accent/10 border border-fdm-accent/20 items-center justify-center"
        >
          <Ionicons name="call-outline" size={16} color="#ccff00" />
        </TouchableOpacity>
      )}
      {email && (
        <TouchableOpacity
          onPress={handleEmail}
          className="w-9 h-9 rounded-full bg-fdm-accent/10 border border-fdm-accent/20 items-center justify-center"
        >
          <Ionicons name="mail-outline" size={16} color="#ccff00" />
        </TouchableOpacity>
      )}
    </View>
  );
}
