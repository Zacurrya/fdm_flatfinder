import { ReactNode } from "react";
import { useWindowDimensions, View, ViewStyle } from "react-native";

type MessageBubbleProps = {
  isMe: boolean;
  children: ReactNode;
  style?: ViewStyle;
  xPadding?: number;
  topPadding?: number;
  bottomPadding?: number;
};

/**
 * Shared message bubble wrapper that handles consistent styling and width constraints.
 */
const MessageBubble = ({
  isMe, children, style,
  xPadding = 4,
  topPadding = 2,
  bottomPadding = 2
}: MessageBubbleProps) => {
  const { width } = useWindowDimensions();
  // Using absolute pixels for maxWidth ensures consistent rendering across flex layouts
  const maxBubbleWidth = width * 0.7;

  return (
    <View
      className={`px-${xPadding} pt-${topPadding} pb-${bottomPadding} rounded-2xl ${isMe
        ? "bg-fdm-accent rounded-tr-sm"
        : "bg-fdm-fg/10 border border-fdm-fg/10 rounded-tl-sm"
        }`}
      style={[
        {
          maxWidth: maxBubbleWidth,
          alignSelf: isMe ? "flex-end" : "flex-start",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default MessageBubble;
