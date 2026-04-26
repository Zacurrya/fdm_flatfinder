import { Dropdown } from "@/components/ui/Dropdown";
import { PropertyType, RentPeriod } from "@/types/enums";
import AuthButton from "@components/auth/AuthButton";
import FDMLoader from "@components/ui/FDMLoader";
import Field from "@components/ui/Field";
import { Ionicons } from "@expo/vector-icons";
import { useListingUpload } from "@hooks/listings/useListingUpload";
import { useAuth } from "@hooks/general/useAuth";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export const AddListingForm = () => {
  const { user } = useAuth();
  const {
    title, setTitle,
    description, setDescription,
    address, setAddress,
    price, setPrice,
    rentPeriod, setRentPeriod,
    bedrooms, setBedrooms,
    bathrooms, setBathrooms,
    propertyType, setPropertyType,
    photos,
    isSubmitting,
    uploadError,
    errors,
    pickImage,
    removePhoto,
    handleSubmit,
  } = useListingUpload();

  if (isSubmitting) {
    return <FDMLoader caption="Uploading listing" />;
  }

  return (
    <View className="gap-4">
      {/* Photos */}
      <View>
        <Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">Photos</Text>
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
        {errors.photos ? <Text className="text-red-400 text-xs ml-1 mt-1">{errors.photos}</Text> : null}
      </View>

      {/* Text fields */}
      <Field
        label="Property Title"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Modern Studio in Canary Wharf"
        error={errors.title}
      />
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Tell us more about the property..."
        multiline
        numberOfLines={4}
        error={errors.description}
      />

      {/* City and Address row */}
      <View className="flex-row gap-4">
        <View className="flex-1">
          <Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">City</Text>
          <View className="h-14 bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl px-4 justify-center">
            {/* user's office */}
            <Text className="text-fdm-accent text-xl tracking-tighter" style={{ fontFamily: "Michroma_400Regular" }}>{user?.officeLocation}</Text>
          </View>
          {errors.city ? <Text className="text-red-400 text-xs ml-1 mt-1">{errors.city}</Text> : null}
        </View>
        <Field
          label="Property Address"
          value={address}
          onChangeText={setAddress}
          placeholder="e.g. 10 Canada Square, E14 5AB"
          containerClassName="flex-1"
          error={errors.address}
        />
      </View>

      {/* Rent row */}
      <View className="flex-row gap-4">
        <Field
          label="Rent Amount (£)"
          value={String(price === 0 ? "" : price)}
          onChangeText={(text) => setPrice(Number(text) || 0)}
          placeholder="0"
          keyboardType="numeric"
          containerClassName="flex-1"
          error={errors.price}
        />
        <View className="flex-1">
          <Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">Rent Period</Text>
          <View className="h-14 bg-fdm-fg/5 border border-fdm-fg/10 rounded-2xl overflow-hidden justify-center">
            <TouchableOpacity
              onPress={() => setRentPeriod(
                rentPeriod === RentPeriod.WEEKLY ? RentPeriod.BIWEEKLY
                  : rentPeriod === RentPeriod.BIWEEKLY ? RentPeriod.MONTHLY
                    : RentPeriod.WEEKLY
              )}
              className="px-4 py-3"
            >
              <Text className="text-fdm-fg font-bold text-center">
                {rentPeriod === RentPeriod.WEEKLY ? "Weekly" : rentPeriod === RentPeriod.BIWEEKLY ? "Bi-Weekly" : "Monthly"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Beds / Baths row (Dropdowns) */}
      <View className="flex-row gap-4">
        <View className="flex-1">
          <Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">Bedrooms</Text>
          <Dropdown
            placeholder="Select..."
            value={bedrooms ?? null}
            options={[
              { label: "Select...", value: null },
              { label: "1", value: 1 },
              { label: "2", value: 2 },
              { label: "3", value: 3 },
              { label: "4", value: 4 },
              { label: "5", value: 5 },
            ]}
            onChange={setBedrooms}
          />
        </View>
        <View className="flex-1">
          <Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">Bathrooms</Text>
          <Dropdown
            placeholder="Select..."
            value={bathrooms ?? null}
            options={[
              { label: "Select...", value: null },
              { label: "1", value: 1 },
              { label: "2", value: 2 },
              { label: "3", value: 3 },
              { label: "4", value: 4 },
              { label: "5", value: 5 },
            ]}
            onChange={setBathrooms}
          />
        </View>
      </View>

      {/* Property Type */}
      <View>
        <Text className="text-fdm-fg/80 font-medium mb-2 ml-1 text-sm uppercase tracking-wider">Property Type</Text>
        <View className="flex-row flex-wrap gap-2">
          {[PropertyType.FLAT, PropertyType.STUDIO, PropertyType.TERRACEDHOUSE, PropertyType.SEMIDETACHED, PropertyType.DETACHED].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setPropertyType(type)}
              className={`px-4 py-2 rounded-xl border ${propertyType === type ? "bg-fdm-accent/20 border-fdm-accent" : "bg-fdm-fg/5 border-fdm-fg/10"}`}
            >
              <Text className={propertyType === type ? "text-fdm-accent font-bold" : "text-fdm-fg/70"}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Error message */}
      {uploadError ? (
        <Text className="text-red-400 text-sm text-center">{uploadError}</Text>
      ) : null}

      {/* Submit button */}
      <AuthButton
        label="Upload Listing"
        onPress={handleSubmit}
        isLoading={isSubmitting}
        backgroundColour="#ccff00"
        textColour="#1b1b1b"
        style={{ marginTop: 8 }}
      />
    </View>
  );
};
