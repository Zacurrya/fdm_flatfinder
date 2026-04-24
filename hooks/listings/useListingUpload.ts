import { ListingSource, PropertyType, RentPeriod } from "@/types/enums";
import { useAuth } from "@hooks/useAuth";
import { useUploadPhotos } from "@hooks/useUploadPhotos";
import { ListingService } from "@services/listings/listingsService";
import { LocationService } from "@services/locations/locationService";
import { fields } from "@utils/inputValidation";
import { useRouter } from "expo-router";
import { useState } from "react";

export const useListingUpload = () => {
    const router = useRouter();
    const { user } = useAuth();

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [price, setPrice] = useState<number>(0);
    const [rentPeriod, setRentPeriod] = useState<RentPeriod>(RentPeriod.WEEKLY);
    const [bedrooms, setBedrooms] = useState<number>(1);
    const [bathrooms, setBathrooms] = useState<number>(1);
    const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.FLAT);
    const [photos, setPhotos] = useState<string[]>([]);

    // Async state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const city = user?.officeLocation ?? "";

    const photoUploader = useUploadPhotos({ bucket: "listing-images", multiple: true });

    // -- Photo management --

    const pickImage = async () => {
        const uris = await photoUploader.pickImages();
        if (uris.length > 0) {
            setPhotos(prev => [...prev, ...uris]);
            if (errors.photos) setErrors(prev => ({ ...prev, photos: "" }));
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    // -- Submission --

    const uploadListing = async (): Promise<boolean> => {
        if (!user?.userId) return false;

        setUploadError(null);
        setErrors({});

        // Validate fields
        const newErrors: Record<string, string> = {};
        const titleErr = fields.title(title);
        const descErr = fields.description(description);
        const addressErr = fields.address(address);
        const priceErr = fields.rentAmount(price);
        const photosErr = fields.photos(photos);

        if (titleErr) newErrors.title = titleErr;
        if (descErr) newErrors.description = descErr;
        if (addressErr) newErrors.address = addressErr;
        if (priceErr) newErrors.price = priceErr;
        if (photosErr) newErrors.photos = photosErr;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setUploadError("Please fix the errors below.");
            return false;
        }

        setIsSubmitting(true);

        try {
            // Upload photos via shared hook
            const uploadedPhotoUrls = await photoUploader.uploadMany(photos);

            // Create listing record
            await ListingService.createListing({
                userId: user.userId,
                title,
                description,
                price,
                rent_period: rentPeriod,
                property_type: propertyType,
                bedrooms,
                bathrooms,
                source: ListingSource.FDM,
                photos: uploadedPhotoUrls,
                city,
                address,
            });

            return true;
        } catch (e: any) {
            setUploadError(e.message ?? "Could not upload listing. Please try again.");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        const success = await uploadListing();
        if (success) {
            router.push("/(tabs)/search");
        }
    };

    const updateField = (field: string, value: any, setter: (val: any) => void) => {
        setter(value);
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    return {
        // Form state
        title, setTitle: (val: string) => updateField("title", val, setTitle),
        description, setDescription: (val: string) => updateField("description", val, setDescription),
        city,
        address, setAddress: (val: string) => updateField("address", val, setAddress),
        price, setPrice: (val: number) => updateField("price", val, setPrice),
        rentPeriod, setRentPeriod,
        bedrooms, setBedrooms,
        bathrooms, setBathrooms,
        propertyType, setPropertyType,
        photos,
        // Async state
        isSubmitting,
        uploadError,
        errors,
        // Actions
        pickImage,
        removePhoto,
        handleSubmit,
    };
};
