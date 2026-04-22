import { uploadListingPhoto } from "@services/listings/listingController";
import { logger } from "@utils/logger";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

/**
 * useChatInput
 * Centralises input state, attachment, and send/upload logic
 * by both private and city chat screens.
 *
 * @param sendFn  Async function that sends the final message content string.
 */
export function useChatInput(sendFn: (content: string) => Promise<void>) {
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<{ uri: string; type: "image" } | null>(null);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSend = useCallback(async () => {
    const content = inputText.trim();
    if ((!content && !attachment) || sending) return;

    const capturedAttachment = attachment;
    setInputText("");
    setAttachment(null);
    setSending(true);

    try {
      let finalContent = content;

      if (capturedAttachment) {
        setUploadingImage(true);
        try {
          const uploadedUrl = await uploadListingPhoto({ uri: capturedAttachment.uri });
          finalContent = content ? `${uploadedUrl} ${content}` : uploadedUrl;
        } finally {
          setUploadingImage(false);
          logger.log("Attachment upload completed");
        }
      }

      await sendFn(finalContent);
    } catch (error) {
      console.error("[useChatInput] Failed to send message:", error);
      setInputText(content);
    } finally {
      setSending(false);
      logger.log("Message sent successfully")
    }
  }, [inputText, attachment, sending, sendFn]);

  const handleUploadImage = useCallback(async () => {
    if (uploadingImage) return;

    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (pickerResult.canceled || pickerResult.assets.length === 0) return;

      setAttachment({ uri: pickerResult.assets[0].uri, type: "image" });
    } catch (error) {
      console.error("[useChatInput] Failed to select image:", error);
      Alert.alert("Selection Failed", "We couldn't select your image.");
    }
  }, [uploadingImage]);

  return {
    inputText,
    setInputText,
    attachment,
    setAttachment,
    sending,
    uploadingImage,
    handleSend,
    handleUploadImage,
    /** inputProps passthrough for ChatScreenLayout */
    inputProps: {
      value: inputText,
      onChangeText: setInputText,
      placeholder: attachment ? "Add a caption..." : undefined,
      editable: !uploadingImage,
      onSend: handleSend,
      sendDisabled: (!inputText.trim() && !attachment) || sending || uploadingImage,
      showActions: true,
      onPressImage: handleUploadImage,
      actionsDisabled: uploadingImage || sending,
      attachment,
      onClearAttachment: () => setAttachment(null),
    },
  };
}
