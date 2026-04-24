import { getCityImagePath, OfficeCity, RegionCities } from "@lib/office-cities";
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
    const { data, error } = await supabase
      .from("locations")
      .select("id, name, region, country_code")
      .order("region", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;

    const grouped = new Map<string, OfficeCity[]>();
    for (const row of data ?? []) {
      const entry: OfficeCity = {
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
};
