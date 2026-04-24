import { useAuth } from "@hooks/useAuth";
import { UserService } from "@services/user/userService";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";

/**
 * Handles changing and deleting profile picture changes.
 */
const useProfilePictureManager = () => {
    const { user, refreshUser } = useAuth();
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    /**
     * Handles the selection and upload of a new profile picture.
     */
    const changeProfilePicture = async () => {
        if (!user?.userId) return { success: false, error: 'No user logged in' };

        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.status !== 'granted') {
                Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
                return { success: false, error: 'Permission denied' };
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return { success: false, error: 'Cancelled' };
            }

            setIsUpdating(true);
            const selectedImage = result.assets[0];
            
            // Delegate upload to UserService
            await UserService.uploadProfilePicture(user.userId, { 
                imageUri: selectedImage.uri,
                fileName: selectedImage.fileName ?? undefined,
                mimeType: selectedImage.mimeType ?? undefined
            });
            
            // Refresh local user state
            await refreshUser();
            
            setIsUpdating(false);
            return { success: true };
        } catch (e: any) {
            setIsUpdating(false);
            return { success: false, error: e.message };
        }
    };

    /**
     * Handles the removal of the current profile picture.
     */
    const deleteProfilePicture = async () => {
        if (!user?.userId) return { success: false, error: 'No user logged in' };

        setIsUpdating(true);
        try {
            // Delegate removal to UserService
            await UserService.removeProfilePicture(user.userId);
            
            // Refresh local user state
            await refreshUser();
            
            setIsUpdating(false);
            return { success: true };
        } catch (e: any) {
            setIsUpdating(false);
            return { success: false, error: e.message };
        }
    };

    return {
        isUpdating,
        changeProfilePicture,
        deleteProfilePicture
    };
};

export default useProfilePictureManager;