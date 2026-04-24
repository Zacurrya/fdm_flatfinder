import { Ionicons } from "@expo/vector-icons";
import { Alert, TouchableOpacity } from "react-native";

type DeleteListingButtonProps = {
  onDelete: () => Promise<void>;
  loading?: boolean;
};

const DeleteListingButton: React.FC<DeleteListingButtonProps> = ({ onDelete, loading }) => {
  const handleDeletePress = () => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await onDelete();
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      className={`bg-black/40 backdrop-blur-2xl p-2 rounded-full`}
      onPress={handleDeletePress}
      disabled={loading}
    >
      <Ionicons name="trash-outline" size={28} color="#ef4444" />
    </TouchableOpacity>
  );
};

export default DeleteListingButton;
