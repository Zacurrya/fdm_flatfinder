import { ActionType, RequestType } from "@/types/enums";
import { ListingRecord } from "@/types/records";
import { supabase } from "@lib/supabase";
import { AuditService } from "@services/audit/auditService";
import { RequestService } from "@services/requests/requestService";
import { StorageService } from "@services/storage/storageService";
import { CreateListingDTO, FilterListingsDTO } from "./types";

const mapListing = (data: any): ListingRecord => {

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
    city: data.locations?.name,
    address: data.address,
  };
};

export const ListingService = {
  /**
   * @returns All approved listings
   */
  async fetchListings(locationId?: string): Promise<ListingRecord[]> {
    let query = supabase
      .from("listings")
      .select("*, locations!inner(*)")
      .eq("status", "AVAILABLE");

    if (locationId) {
      query = query.eq("location_id", locationId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapListing);
  },

  /**
   * @returns Full records for all listings favorited by a user
   * Used for the home screen
   */
  async fetchSavedListings(userId: string): Promise<ListingRecord[]> {
    const { data: favs, error: favError } = await supabase
      .from("user_favourites")
      .select("listing_id")
      .eq("user_id", userId);

    if (favError) throw favError;
    if (!favs || favs.length === 0) return [];

    const listingIds = favs.map(f => f.listing_id);

    const { data, error } = await supabase
      .from("listings")
      .select("*, locations(*)")
      .in("id", listingIds)
      .eq("status", "AVAILABLE")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapListing);
  },

  /**
  * @returns Filtered listings
   */
  async fetchFilteredListings(dto: FilterListingsDTO): Promise<ListingRecord[]> {
    let query = supabase
      .from("listings")
      .select("*, locations(*)")
      .eq("status", "AVAILABLE");
    if (dto.bedrooms) query = query.eq("bedrooms", dto.bedrooms);
    if (dto.bathrooms) query = query.eq("bathrooms", dto.bathrooms);
    if (dto.minPrice) query = query.gte("price", dto.minPrice);
    if (dto.maxPrice) query = query.lte("price", dto.maxPrice);
    if (dto.sourceFilter) query = query.eq("source", dto.sourceFilter);
    if (dto.locationId) query = query.eq("location_id", dto.locationId);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    return (data || []).map(mapListing);
  },

  /**
   * Returns a complete record of a single listing.
   */
  async fetchListingById(listingId: string): Promise<ListingRecord> {
    const { data, error } = await supabase
      .from("listings")
      .select("*, locations(*)")
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
  async createListing(dto: CreateListingDTO): Promise<ListingRecord> {
    // Insert listing directly into the listings table
    const { data, error: insertError } = await supabase
      .from("listings")
      .insert({
        owner_id: dto.userId,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        rent_period: dto.rentPeriod,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        source: dto.source,
        media_urls: dto.photos,
        location_id: dto.locationId,
        address: dto.address,
        property_type: dto.propertyType,
        status: "DRAFT",
      })
      .select("*, locations(*)")
      .single();

    if (insertError || !data) {
      throw new Error(insertError?.message ?? "Failed to create listing.");
    }

    try {
      await RequestService.createRequest({
        userId: dto.userId,
        requestType: RequestType.LISTING_UPLOAD,
        listingId: isNaN(Number(data.id)) ? data.id : Number(data.id) as any,
      });
    } catch (requestError) {
      await supabase.from("listings").delete().eq("id", data.id);
      throw requestError;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const actorUserId = sessionData?.session?.user?.id ?? dto.userId;

    // Log audit
    await AuditService.logAction({
      actionType: ActionType.LISTING_UPLOAD_REQUESTED,
      userId: actorUserId,
      targetId: dto.userId
    });

    return mapListing(data);
  },

  /**
   * Uploads a photo to the 'listing-images' bucket in Supabase storage.
   * @param uri The file path of the image to upload.
   * @returns The public URL of the uploaded image.
   */
  async uploadListingPhoto(uri: string): Promise<string> {
    return StorageService.uploadFile('listing-images', uri);
  }
};