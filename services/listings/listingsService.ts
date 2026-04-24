import { RequestType } from "@/types/enums";
import { Listing } from "@/types/views";
import { supabase } from "@lib/supabase";
import { RequestService } from "@services/requests/requestService";
import { File as ExpoFile } from 'expo-file-system';
import { CreateListingDTO, FilterListingsDTO } from "./types";

const mapListing = (data: any): Listing => {
  const location = Array.isArray(data.listing_locations)
    ? data.listing_locations[0]
    : data.listing_locations;

  return {
    id: String(data.id),
    ownerId: data.owner_id,
    title: data.title,
    description: data.description,
    price: data.price,
    rentPeriod: data.rent_period,
    locationId: data.location_id,
    mediaUrls: data.media_urls || [],
    source: data.source,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    propertyType: data.property_type ?? null,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at || data.created_at,
    city: location?.city,
    address: location?.address,
  };
};

export const ListingService = {
  /**
   * @returns All approved listings
   */
  async fetchListings(city?: string): Promise<Listing[]> {
    let query = supabase
      .from("listings")
      .select("*, listing_locations!inner(*)")
      .eq("status", "APPROVED");

    if (city) {
      query = query.eq("listing_locations.city", city);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapListing);
  },

  /**
  * @returns Filtered listings
   */
  async fetchFilteredListings(dto: FilterListingsDTO): Promise<Listing[]> {
    let query = supabase
      .from("listings")
      .select("*, listing_locations(*)")
      .eq("status", "APPROVED");

    if (dto.bedrooms) query = query.eq("bedrooms", dto.bedrooms);
    if (dto.bathrooms) query = query.eq("bathrooms", dto.bathrooms);
    if (dto.minPrice) query = query.gte("price", dto.minPrice);
    if (dto.maxPrice) query = query.lte("price", dto.maxPrice);
    if (dto.sources && dto.sources.length > 0) query = query.in("source", dto.sources);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapListing);
  },

  /**
   * Returns a complete record of a single listing.
   */
  async fetchListingById(listingId: string): Promise<Listing> {
    const { data, error } = await supabase
      .from("listings")
      .select("*, listing_locations(*)")
      .eq("id", listingId)
      .single();

    if (error || !data) throw new Error(error?.message ?? "Listing not found.");
    return mapListing(data);
  },

  /**
   * Deletes a listing and its associated favourites.
   */
  async deleteListing(listingId: string): Promise<void> {
    // First delete all listing favourites
    const { error: favouritesDeleteError } = await supabase
      .from("user_favourites")
      .delete()
      .eq("listing_id", listingId);

    if (favouritesDeleteError) { throw favouritesDeleteError; }

    // Then delete listing record
    const { error: listingDeleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (listingDeleteError) throw listingDeleteError;
  },

  /**
   * Creates a new listing in PENDING status and triggers an approval request.
   */
  async createListing(dto: CreateListingDTO): Promise<Listing> {
    // Insert listing location first to get its ID
    const { data: locData, error: locError } = await supabase
      .from("listing_locations")
      .insert({
        city: dto.city,
        address: dto.address,
      })
      .select()
      .single();

    if (locError || !locData) throw locError ?? new Error("Failed to create listing location.");

    // Then insert listing and its location ID into the listings table
    const { data, error: insertError } = await supabase
      .from("listings")
      .insert({
        owner_id: dto.userId,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        rent_period: dto.rent_period as any,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        source: dto.source,
        media_urls: dto.photos,
        location_id: locData.id,
        status: "PENDING",
      })
      .select()
      .single();

    if (insertError || !data) {
      await supabase.from("listing_locations").delete().eq("id", locData.id);
      throw new Error(insertError?.message ?? "Failed to create listing.");
    }

    try {
      await RequestService.createRequest({
        userId: dto.userId,
        requestType: RequestType.LISTING_UPLOAD,
        listingId: data.id as any,
      });
    } catch (requestError) {
      await supabase.from("listings").delete().eq("id", data.id);
      throw requestError;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const actorUserId = sessionData?.session?.user?.id ?? dto.userId;

    await supabase.from("audit_logs").insert({
      action_type: "LISTING_UPLOAD_REQUESTED",
      user_id: actorUserId,
      target_id: dto.userId,
    });

    const { data: listingWithLocation, error: fetchCreatedError } = await supabase
      .from("listings")
      .select("*, listing_locations(*)")
      .eq("id", data.id)
      .single();

    if (fetchCreatedError || !listingWithLocation) throw new Error(fetchCreatedError?.message ?? "Listing created but fetch failed.");

    return mapListing(listingWithLocation);
  },

  /**
   * Uploads a photo to the 'listing-images' bucket in Supabase storage.
   * @param uri The file path of the image to upload.
   * @returns The public URL of the uploaded image.
   */
  async uploadListingPhoto(uri: string): Promise<string> {
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = ext === 'heic' ? 'image/heic' : ext === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = `listing_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    // Creates a local file object to read bits
    const imageFile = new ExpoFile(uri);
    const arrayBuffer = await imageFile.arrayBuffer();

    // Sends image to the bucket
    const { error } = await supabase.storage
      .from('listing-images')
      .upload(fileName, arrayBuffer, { contentType, upsert: false });

    if (error) throw error;

    // Builds the public url directly since the bucket is public
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/listing-images/${fileName}`;
  }
};