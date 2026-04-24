export type OfficeCity = {
  name: string;
  countryCode?: string;
  imagePath?: any;
  chatId?: string;
};
/**
 * Mapping of city name to city chatId.
 */
export const cityChatIdMap: Record<string, string> = {
  "London": "5ff5c848-a371-43b4-b151-1e8f52af7f0b",
  "Leeds": "5932946b-7b09-457d-a27e-02bf96b6557a",
  "Glasgow": "dca62415-32e8-4200-a116-e2f184939cae",
  "Brighton": "459a00f4-13eb-4f00-ae80-52ed058f69dc",
  "Frankfurt": "0292d840-7cb2-4157-8315-1021d12cf5b5",
  "Luxembourg": "a175c4bc-92da-4db9-810c-f29583e999fc",
  "Watermael-Boitsfort": "1dc9c74b-652d-4b04-bab5-0af51f75da82",
  "Dublin": "f030fe05-2df2-46ba-b4b4-4219d520d7a6",
  "Limerick": "debd4e90-6735-4455-861f-a304fff6535a",
  "Zurich": "0aa39a92-14fb-4d49-92ee-6d3233dc01f2",
  "Krakow": "c6563dcb-4695-414f-aa41-4cf2c6b7563a",
  "Austin": "59aa818a-0346-4995-80f5-ffa712e9edf5",
  "Charlotte": "7e550707-eebc-422d-828c-9bbc1a513aea",
  "New York": "3c2e06f2-1501-482a-b289-e1d36943ccdb",
  "St Petersburg": "4ec2f15e-1479-447b-a89a-725192b162b9",
  "Toronto": "9a05fc1d-19b7-457c-a342-0f5efcb2a9dd",
  "Montreal": "1dde0ee0-648f-4786-94f4-39811a282483",
  "Shanghai": "4ee9e2f5-dbc6-465a-aebe-d8361057a054",
  "Hong Kong": "e30e62b4-e6ff-49c8-a13a-eb1c81b8090e",
  "Singapore": "47a7b160-c44f-4581-ba3a-46603dacb24d",
  "Kuala Lumpur": "365133cd-b5c4-4b46-89c2-6c1fc70057e1",
  "Sydney": "0ed262d1-6f84-4035-9919-5102df3a760d",
  "Melbourne": "875bf7d0-73f6-448c-96d8-7a8eac701eb0",
  "Auckland": "f0af26f0-37b2-4383-8ac4-8ec9bfb52086",
  "Germiston": "e2dfe7a7-1b21-4e3d-bda7-f1babbd77949",
};

/**
 * Helper to get OfficeCity by chatId (case-insensitive on city name).
 */
export function getCityByChatId(chatId: string, citiesByRegion: RegionCities[]): OfficeCity | undefined {
  for (const region of citiesByRegion) {
    for (const city of region.cities) {
      if (cityChatIdMap[city.name] === chatId) {
        return { ...city, chatId };
      }
    }
  }
  return undefined;
}

export type RegionCities = {
  region: string;
  cities: OfficeCity[];
};

export type OfficeCitySelection = {
  region: string;
  city: OfficeCity;
};

/**
 * Local asset map for city images.
 * Only cities with a bundled icon are listed here.
 * This is used by LocationService to enrich database rows with image data.
 */
export const cityImageMap: Record<string, any> = {
  "london": require("@assets/images/city-icons/london.svg"),
  "hong kong": require("@assets/images/city-icons/hong-kong.svg"),
  "singapore": require("@assets/images/city-icons/singapore.svg"),
};

/**
 * Returns the bundled image asset for a city, or undefined if none exists.
 */
export const getCityImagePath = (cityName: string): any | undefined => {
  return cityImageMap[cityName.trim().toLowerCase()];
};
