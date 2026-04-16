import { supabase } from "../../lib/supabase";
import { Database } from "../../types/database.types";

export type Listing = Database["public"]["Tables"]["Listings"]["Row"];
export type InsertListing = Database["public"]["Tables"]["Listings"]["Insert"];

// fetch listings

// gets all the flats from the database so we can show them on the home page
export const fetchListings = async (): Promise<Listing[]> => {
  const { data, error } = await supabase
    .from("Listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }

  return data || [];
};

// fetch single listing

// gets one specific listing by its id so we can show the detail page
export const fetchListingById = async (id: number | string): Promise<Listing> => {
  const { data, error } = await supabase
    .from("Listings")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error) {
    console.error(`Error fetching listing ${id}:`, error);
    throw error;
  }

  return data;
};

// delete listing

// removes a listing from the database when the owner wants to take it down
export const deleteListing = async (id: number | string): Promise<void> => {
  const { error } = await supabase
    .from("Listings")
    .delete()
    .eq("id", Number(id));
    
  if (error) {
    console.error(`Error deleting listing ${id}:`, error);
    throw error;
  }
};

// create listing

// saves a new flat listing into the database using supabase
export const createListing = async (listing: InsertListing): Promise<Listing> => {
  const { data, error } = await supabase
    .from("Listings")
    .insert(listing)
    .select()
    .single();

  if (error) {
    console.error("Error creating listing:", error);
    throw error;
  }

  return data;
};

// upload photo

// takes a photo from the user's phone and uploads it to the supabase storage bucket
// returns the public URL so we can store it in the listing record

import { File as ExpoFile } from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';

export const uploadListingPhoto = async (uri: string): Promise<string> => {
  try {
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = ext === 'heic' ? 'image/heic' : ext === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = `listing_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    // create local file object to read bits properly just like profile pics
    const imageFile = new ExpoFile(uri);
    const arrayBuffer = await imageFile.arrayBuffer();

    // send the image to supabase storage
    const { data, error } = await supabase.storage
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

export const getSignedListingPhotoUrl = async (url: string): Promise<string> => {
  if (!url) return url;
  // if its already signed or not from our bucket just return it
  if (url.includes('/object/sign/') || !url.includes('listing-images/')) return url;
  
  try {
    const path = url.split('listing-images/')[1]?.split('?')[0];
    if (!path) return url;
    
    // create signed url valid for 1 hour
    const { data, error } = await supabase.storage
      .from('listing-images')
      .createSignedUrl(path, 3600);
      
    if (error || !data?.signedUrl) {
      console.warn("Failed to sign url", error);
      return url; // fallback to original
    }
    
    return data.signedUrl;
  } catch (e) {
    return url;
  }
};
