import { OfficeCity, RegionCities } from "@/types/locations";
import { getCityImageById } from "@lib/office-cities";
import { supabase } from "@lib/supabase";

export type LocationRecord = {
  id: string;
  city: string;
  region: string;
  countryCode: string;
};

export const LocationService = {
  /**
   * Fetches all locations from the database and groups them by region.
   * Enriches each city with a local image asset if one is available.
   */
  async getCitiesByRegion(): Promise<RegionCities[]> {
    // Gets all cities from the database
    const { data, error } = await supabase
      .from("locations")
      .select("id, name, region, country_code")
      .order("region", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;

    // Groups cities by region for display in the modal
    const grouped: Record<string, OfficeCity[]> = {};
    for (const row of data ?? []) {
      const entry: OfficeCity = {
        id: row.id,
        name: row.name,
        countryCode: row.country_code,
        imagePath: getCityImageById(row.id),
      };
      if (!grouped[row.region]) {
        grouped[row.region] = [];
      }
      grouped[row.region].push(entry);
    }

    return Object.entries(grouped).map(([region, cities]) => ({ region, cities }));
  },

  /**
   * Fetches a single location record by its ID.
   */
  async getLocationById(locationId: string): Promise<LocationRecord & { chatId: string | null }> {
    const { data, error } = await supabase
      .from("locations")
      .select("id, name, region, country_code, chat_id")
      .eq("id", locationId)
      .single();

    if (error || !data) throw new Error(error?.message ?? "Location not found.");

    return {
      id: data.id,
      city: data.name,
      region: data.region,
      countryCode: data.country_code,
      chatId: data.chat_id,
    };
  },
};
