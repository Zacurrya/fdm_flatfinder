import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { TouchableOpacity } from 'react-native';

const NotificationButton = ({ onPressNotifications }: { onPressNotifications: () => void }) => {
  return (
    <TouchableOpacity
        className="w-10 h-10 self-start rounded-full bg-fdm-fg/10 border border-fdm-fg/10 items-center justify-center"
        onPress={onPressNotifications}
        accessibilityLabel="Open notifications"
    >
        <Ionicons name="notifications-outline" size={20} color="#ffffff" />
    </TouchableOpacity>
  )
}

export default NotificationButton