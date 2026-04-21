import {
  InsertListing,
  Listing,
} from "./types";
import { supabase } from "@lib/supabase";
import { File as ExpoFile } from 'expo-file-system';
import * as RequestService from "@services/requests/requestService";
import { Database } from "@/types/database.types";

// fetch listings

// gets all the flats from the database so we can show them on the home page
export const fetchListings = async (): Promise<Listing[]> => {
  const { data, error } = await supabase
    .from("Listings")
    .select("*, ListingLocations(*)")
    .eq("approvalStatus", "APPROVED")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }

  return data || [];
};

// Fetch single listing
// Fetches a single listing to display its listing page and full details
export const fetchListingById = async (id: number | string): Promise<Listing> => {
  const { data, error } = await supabase
    .from("Listings")
    .select("*, ListingLocations(*)")
    .eq("id", Number(id))
    .single();

  if (error) {
    console.error(`Error fetching listing ${id}:`, error);
    throw error;
  }

  return data;
};

// Delete listing
// removes a listing from the database when the owner wants to take it down
export const deleteListing = async (id: number | string): Promise<void> => {
  const listingId = Number(id);

  const { error: favouritesDeleteError } = await supabase
    .from("UserFavourites")
    .delete()
    .eq("listingId", listingId);

  if (favouritesDeleteError) {
    console.error(`Error deleting favourites for listing ${id}:`, favouritesDeleteError);
    throw favouritesDeleteError;
  }

  const { error: listingDeleteError } = await supabase
    .from("Listings")
    .delete()
    .eq("id", listingId);

  if (listingDeleteError) {
    console.error(`Error deleting listing ${id}:`, listingDeleteError);
    throw listingDeleteError;
  }
};

// Create listing
// Creates a listing in the database with PENDING status, creating a request for admin approval
export const createListing = async (listing: InsertListing, city: string, address: string): Promise<Listing> => {
  const listingToInsert: InsertListing = {
    ...listing,
    approvalStatus: "PENDING",
  };

  const { data, error } = await supabase
    .from("Listings")
    .insert(listingToInsert)
    .select()
    .single();

  if (error || !data) {
    console.error("Error creating listing:", error);
    throw error;
  }

  const { error: locError } = await supabase
    .from("ListingLocations")
    .insert({
      listingId: data.id,
      city,
      address,
    });

  if (locError) {
    await supabase.from("Listings").delete().eq("id", data.id);
    console.error("Error creating listing location:", locError);
    throw locError;
  }

  const requestResult = await RequestService.createRequest({
    userId: data.userId,
    requestType: "LISTING_UPLOAD",
    listingId: data.id,
  });

  if (!requestResult.success) {
    await supabase.from("Listings").delete().eq("id", data.id);
    throw new Error(requestResult.error ?? "Failed to create listing approval request.");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const actorUserId = sessionData?.session?.user?.id ?? data.userId;

  await supabase.from("AuditLogs").insert({
    actionType: "LISTING_UPLOAD_REQUESTED",
    userId: actorUserId,
    targetId: data.userId,
  });

  const { data: listingWithLocation, error: fetchCreatedError } = await supabase
    .from("Listings")
    .select("*, ListingLocations(*)")
    .eq("id", data.id)
    .single();

  if (fetchCreatedError || !listingWithLocation) {
    console.error("Error fetching created listing:", fetchCreatedError);
    throw fetchCreatedError ?? new Error("Listing created but could not be fetched.");
  }

  return listingWithLocation;
};

// Upload photo
// takes a photo from the user's phone and uploads it to the supabase storage bucket
// returns the public URL so we can store it in the listing record
export const uploadListingPhoto = async (uri: string): Promise<string> => {
  try {
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = ext === 'heic' ? 'image/heic' : ext === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = `listing_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    // create local file object to read bits properly just like profile pics
    const imageFile = new ExpoFile(uri);
    const arrayBuffer = await imageFile.arrayBuffer();

    // send the image to supabase storage
    const { error } = await supabase.storage
      .from('listing-images')
      .upload(fileName, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // build the public url directly since the bucket is public
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/listing-images/${fileName}`;
  } catch (error) {
    console.error("Failed to upload photo:", error);
    throw error;
  }
};


