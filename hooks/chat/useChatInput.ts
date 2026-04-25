import { useUploadPhotos } from "@hooks/useUploadPhotos";
import * as validateUtil from "@utils/inputValidation";
import { useCallback, useState } from "react";

/**
 * useChatInput
 * Centralises input state, attachment, and send/upload logic
 * by both private and city chat screens.
 *
 * @param sendFn  Async function that sends the final message content string.
 */
export const useChatInput = (sendFn: (content: string) => Promise<void>) => {
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<{ uri: string; type: "image" } | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { isUploading: isUploadingImage, pickImages, uploadOne } = useUploadPhotos({
    bucket: "listing-images",
    multiple: false,
  });

  const handleSend = useCallback(async () => {
    const content = inputText.trim();
    if ((!validateUtil.message(content) && !attachment) || isSending) return;

    const capturedAttachment = attachment;
    setInputText("");
    setAttachment(null);
    setIsSending(true);

    try {
      let finalContent = content;

      if (capturedAttachment) {
        try {
          const uploadedUrl = await uploadOne(capturedAttachment.uri);
          finalContent = content ? `${uploadedUrl} ${content}` : uploadedUrl;
        } finally {
          console.log("Attachment upload completed");
        }
      }

      await sendFn(finalContent);
    } catch (error) {
      console.error("[useChatInput] Failed to send message:", error);
      setInputText(content);
    } finally {
      setIsSending(false);
      console.log("Message sent successfully");
    }
  }, [inputText, attachment, isSending, sendFn, uploadOne]);

  const handleUploadImage = useCallback(async () => {
    if (isUploadingImage) return;

    const uris = await pickImages();
    if (uris.length > 0) {
      setAttachment({ uri: uris[0], type: "image" });
    }
  }, [isUploadingImage, pickImages]);

  return {
    inputText,
    setInputText,
    attachment,
    setAttachment,
    isSending,
    isUploadingImage,
    handleSend,
    handleUploadImage,
    /** inputProps passthrough for ChatScreenLayout */
    inputProps: {
      value: inputText,
      onChangeText: setInputText,
      placeholder: attachment ? "Add a caption..." : undefined,
      editable: !isUploadingImage,
      onSend: handleSend,
      sendDisabled: (!validateUtil.message(inputText) && !attachment) || isSending || isUploadingImage,
      showActions: true,
      onPressImage: handleUploadImage,
      actionsDisabled: isUploadingImage || isSending,
      attachment,
      onClearAttachment: () => setAttachment(null),
    },
  };
}
