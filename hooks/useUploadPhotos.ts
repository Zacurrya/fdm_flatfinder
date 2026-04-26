import { StorageService } from "@services/storage/storageService";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";

export type UploadPhotosOptions = {
    /** Supabase storage bucket name, e.g. "listing-images" or "profile-pictures" */
    bucket: string;
    /** Optional path prefix inside the bucket, e.g. a userId folder */
    pathPrefix?: string;
    /** Allow selecting multiple photos (default: true) */
    multiple?: boolean;
    /** ImagePicker quality 0-1 (default: 0.8) */
    quality?: number;
    /** Force square crop (useful for profile pictures) */
    squareCrop?: boolean;
};

/**
 * useUploadPhotos
 *
 * Reusable hook that handles:
 *  - Picking one or multiple images from the device library
 *  - Uploading each image to a specified Supabase storage bucket via StorageService
 *  - Returning the public URL(s) of the uploaded file(s)
 *
 * Used by: useListingUpload, useChatInput, useProfilePicture
 */
export const useUploadPhotos = (options: UploadPhotosOptions) => {
    const { bucket, pathPrefix = "", multiple = true, quality = 0.8, squareCrop = false } = options;

    const [isUploading, setIsUploading] = useState(false);

    /**
     * Uploads a single image URI to the configured bucket.
     * @returns The public URL of the uploaded file.
     */
    const uploadOne = async (uri: string): Promise<string> => {
        return StorageService.uploadFile(bucket, uri, { pathPrefix });
    };

    /**
     * Uploads multiple image URIs sequentially.
     * @returns An array of public URLs.
     */
    const uploadMany = async (uris: string[]): Promise<string[]> => {
        const urls: string[] = [];
        for (const uri of uris) {
            urls.push(await uploadOne(uri));
        }
        return urls;
    };

    /**
     * Opens the image picker and returns the selected image URI(s).
     * Does NOT upload — use uploadOne/uploadMany separately.
     */
    const pickImages = async (): Promise<string[]> => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsMultipleSelection: multiple,
                allowsEditing: squareCrop,
                aspect: squareCrop ? [1, 1] : undefined,
                quality,
            });

            if (result.canceled || result.assets.length === 0) return [];
            return result.assets.map((a) => a.uri);
        } catch (e) {
            console.error("[useUploadPhotos] Failed to pick image:", e);
            Alert.alert("Selection Failed", "We couldn't open your photo library.");
            return [];
        }
    };

    /**
     * Convenience: picks and immediately uploads image(s).
     * @returns Array of uploaded public URLs (empty if cancelled).
     */
    const pickAndUpload = async (): Promise<string[]> => {
        const uris = await pickImages();
        if (uris.length === 0) return [];

        setIsUploading(true);
        try {
            return await uploadMany(uris);
        } finally {
            setIsUploading(false);
        }
    };

    return {
        isUploading,
        pickImages,
        uploadOne,
        uploadMany,
        pickAndUpload,
    };
};
