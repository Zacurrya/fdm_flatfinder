import { OfficeCity, RegionCities } from "@/types/locations";
import { getCityImagePath } from "@lib/office-cities";
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
    const grouped = new Map<string, OfficeCity[]>();
    for (const row of data ?? []) {
      const entry: OfficeCity = {
        id: row.id,
        name: row.name,
        countryCode: row.country_code,
        imagePath: getCityImagePath(row.name),
      };
      if (!grouped.has(row.region)) {
        grouped.set(row.region, []);
      }
      grouped.get(row.region)!.push(entry);
    }

    return Array.from(grouped.entries()).map(([region, cities]) => ({ region, cities }));
  },

  /**
   * Fetches a single location record by city name.
   */
  async getLocationByCity(cityName: string): Promise<LocationRecord | null> {
    const { data, error } = await supabase
      .from("locations")
      .select("id, name, region, country_code")
      .ilike("name", cityName.trim())
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      city: data.name,
      region: data.region,
      countryCode: data.country_code,
    };
  },

  /**
   * Location UUID -> City name
   */
  async resolveOfficeCityName(officeLocation: string): Promise<string> {
    if (!officeLocation) return officeLocation;

    // Try to resolve the value as an ID from the locations table
    const { data, error } = await supabase
      .from("locations")
      .select("name")
      .eq("id", officeLocation)
      .single();

    if (error) throw error;

    return data.name;
  },
};
