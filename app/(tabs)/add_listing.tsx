import AppTrademark from "@components/ui/AppTrademark";
import BackgroundCircle from "@components/ui/BackgroundCircle";
import ScreenHeader from "@components/ui/ScreenHeader";
import AwaitingApprovalView from "@components/ui/AwaitingApprovalView";
import { useAuth } from "@context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { createListing, InsertListing, uploadListingPhoto } from "@services/listings/listingController";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

// add listing screen

// shows a form so users can type in their flat details to upload
// then it sends the data to the listings service
export default function AddListingScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState(user?.officeLocation || "");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [rentPeriod, setRentPeriod] = useState<"WEEKLY" | "BIWEEKLY" | "MONTHLY">("WEEKLY");
  const [beds, setBeds] = useState("1");
  const [baths, setBaths] = useState("1");
  const [propertyType, setPropertyType] = useState<"FLAT" | "STUDIO" | "TERRACEDHOUSE" | "SEMIDETACHED" | "DETACHED">("FLAT");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user?.approvalStatus === "PENDING" || user?.approvalStatus === "REJECTED") {
    return (
      <AwaitingApprovalView
        title={user.approvalStatus === "REJECTED" ? "Account Denied" : "Awaiting Admin Approval"}
        message="You must be an approved user to upload listings."
      />
    );
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri);
      setPhotos([...photos, ...uris]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    if (!title || !city || !address || !price) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    if (!user?.userId) return;

    setIsSubmitting(true);
    try {
      // 1. upload the photos first
      const uploadedPhotoUrls = [];
      for (const uri of photos) {
        const url = await uploadListingPhoto({ uri });
        uploadedPhotoUrls.push(url);
      }

      // 2. submit the listing data to supabase
      const newListing: InsertListing = {
        title,
        description: description,
        price: parseFloat(price) || 0,
        rentPeriod: rentPeriod,
        propertyType: propertyType,
        userId: user.userId,
        photos: uploadedPhotoUrls,
        baths: parseInt(baths) || 1,
        beds: parseInt(beds) || 1,
      };

      await createListing({
        listing: newListing,
        city,
        address,
      });
      Alert.alert(
        "Request Submitted",
        "Your listing was submitted for admin approval and will only appear after approval."
      );
      
      // reset the form fields after successful upload
      setTitle("");
      setDescription("");
      setCity(user?.officeLocation || "");
      setAddress("");
      setPrice("");
      setBeds("1");
      setBaths("1");
      setPhotos([]);
      
      router.push("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not upload listing. Double check Supabase schema.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-fdm-bg">
      <StatusBar style="light" />
      <BackgroundCircle top={0} right={0} color="#CCFF001A" opacity={0.5} />
      
      <ScreenHeader title="Add" highlightedTitle="Listing" />

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60, paddingTop: 0 }}>

        <View className="gap-4">
          <View>
            <Text className="text-fdm-fg/70 mb-1 ml-1 text-sm">Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
              <TouchableOpacity
                onPress={pickImage}
                className="w-24 h-24 bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl items-center justify-center mr-3"
              >
                <Ionicons name="camera" size={32} color="#ffffff50" />
                <Text className="text-fdm-fg/50 text-xs mt-1">Upload</Text>
              </TouchableOpacity>
              
              {photos.map((uri, index) => (
                <View key={index} className="w-24 h-24 mr-3 relative">
                  <Image source={{ uri }} className="w-full h-full rounded-2xl" />
                  <TouchableOpacity
                    onPress={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <View>
            <Text className="text-fdm-fg/70 mb-1 ml-1 text-sm">Property Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Modern Studio in Canary Wharf"
              placeholderTextColor="#ffffff50"
              className="bg-fdm-fg/5 text-fdm-fg border border-fdm-fg/10 rounded-2xl px-4 py-3"
            />
          </View>

          <View>
            <Text className="text-fdm-fg/70 mb-1 ml-1 text-sm">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tell us more about the property..."
              placeholderTextColor="#ffffff50"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-fdm-fg/5 text-fdm-fg border border-fdm-fg/10 rounded-2xl px-4 py-3 min-h-[100px]"
            />
          </View>

          <View>
            <Text className="text-fdm-fg/70 mb-1 ml-1 text-sm">City</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="e.g. London"
              placeholderTextColor="#ffffff50"
              className="bg-fdm-fg/5 text-fdm-fg border border-fdm-fg/10 rounded-2xl px-4 py-3"
            />
          </View>

          <View>
            <Text className="text-fdm-fg/70 mb-1 ml-1 text-sm">Property Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. 10 Canada Square, E14 5AB"
              placeholderTextColor="#ffffff50"
              className="bg-fdm-fg/5 text-fdm-fg border border-fdm-fg/10 rounded-2xl px-4 py-3"
            />
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-fdm-fg/70 mb-1 ml-1 text-sm">Rent Amount (£)</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#ffffff50"
                className="bg-fdm-fg/5 text-fdm-fg border border-fdm-fg/10 rounded-2xl px-4 py-3"
              />
            </View>
            <View className="flex-1">
              <Text className="text-fdm-fg/70 mb-1 ml-1 text-sm">Rent Period</Text>
              <View className="bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl overflow-hidden">
                <TouchableOpacity onPress={() => setRentPeriod(rentPeriod === "WEEKLY" ? "BIWEEKLY" : rentPeriod === "BIWEEKLY" ? "MONTHLY" : "WEEKLY")} className="px-4 py-3">
                  <Text className="text-fdm-fg font-bold text-center">
                    {rentPeriod === "WEEKLY" ? "Weekly" : rentPeriod === "BIWEEKLY" ? "Bi-Weekly" : "Monthly"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-fdm-fg/70 mb-1 ml-1 text-sm">Bedrooms</Text>
              <TextInput
                value={beds}
                onChangeText={setBeds}
                keyboardType="numeric"
                className="bg-fdm-fg/5 text-fdm-fg border border-fdm-fg/10 rounded-2xl px-4 py-3"
              />
            </View>
            <View className="flex-1">
              <Text className="text-fdm-fg/70 mb-1 ml-1 text-sm">Bathrooms</Text>
              <TextInput
                value={baths}
                onChangeText={setBaths}
                keyboardType="numeric"
                className="bg-fdm-fg/5 text-fdm-fg border border-fdm-fg/10 rounded-2xl px-4 py-3"
              />
            </View>
          </View>
          
          <View>
            <Text className="text-fdm-fg/70 mb-1 ml-1 text-sm">Property Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {["FLAT", "STUDIO", "TERRACEDHOUSE", "SEMIDETACHED", "DETACHED"].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setPropertyType(type as any)}
                  className={`px-4 py-2 rounded-xl border ${
                    propertyType === type ? "bg-fdm-accent/20 border-fdm-accent" : "bg-fdm-fg/5 border-fdm-fg/10"
                  }`}
                >
                  <Text className={propertyType === type ? "text-fdm-accent font-bold" : "text-fdm-fg/70"}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`mt-6 py-4 rounded-full items-center justify-center ${
              isSubmitting ? "bg-fdm-accent/50" : "bg-fdm-accent"
            }`}
          >
            <Text className="text-fdm-bg text-base font-bold">
              {isSubmitting ? "Uploading..." : "Upload Listing"}
            </Text>
          </TouchableOpacity>
        </View>
        <AppTrademark />
      </ScrollView>
    </View>
  );
}
