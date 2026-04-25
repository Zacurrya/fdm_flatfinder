import { OfficeCity, RegionCities } from "@/types/locations";

/**
 * Mapping of City ID (from 'locations' table) to its corresponding city Chat ID.
 * Key: City ID (UUID)
 * Value: Chat ID (UUID)
 */
export const cityChatIdMap: Record<string, string> = {
  "71923672-8bd9-421d-8a31-b5c0e923cac9": "5ff5c848-a371-43b4-b151-1e8f52af7f0b", // London
  "206bf2d2-8a33-4b38-b45e-7373901fa1eb": "5932946b-7b09-457d-a27e-02bf96b6557a", // Leeds
  "fb13daf1-4299-45ad-926d-e1a6072d5275": "dca62415-32e8-4200-a116-e2f184939cae", // Glasgow
  "5c5275d2-ddfa-4195-9f7c-77aebeb3b559": "459a00f4-13eb-4f00-ae80-52ed058f69dc", // Brighton
  "85cb1a54-3a90-42e7-bb2d-33263eecabe5": "0292d840-7cb2-4157-8315-1021d12cf5b5", // Frankfurt
  "3126e29c-7889-4af2-8d76-cffc3ad922a4": "a175c4bc-92da-4db9-810c-f29583e999fc", // Luxembourg
  "219fad67-cb78-41a7-8ced-a28a16d0dc62": "1dc9c74b-652d-4b04-bab5-0af51f75da82", // Brussels
  "a5dd0aa1-79f9-48d1-bc84-7c7158710018": "f030fe05-2df2-46ba-b4b4-4219d520d7a6", // Dublin
  "bdb6f929-f8f4-4cdf-be65-962edba5e68e": "debd4e90-6735-4455-861f-a304fff6535a", // Limerick
  "48e9a981-5074-4aa4-bfbf-5ad93ed9450e": "0aa39a92-14fb-4d49-92ee-6d3233dc01f2", // Zurich
  "17d5fea9-6d59-4519-ae31-60bfb9fab707": "c6563dcb-4695-414f-aa41-4cf2c6b7563a", // Krakow
  "40b4cb6a-d985-446e-bb49-42e21d07e569": "59aa818a-0346-4995-80f5-ffa712e9edf5", // Austin
  "46e048f0-c608-44fe-923f-c87994b71fb6": "7e550707-eebc-422d-828c-9bbc1a513aea", // Charlotte
  "1d685815-962f-4fa3-9aac-e3dc02133836": "3c2e06f2-1501-482a-b289-e1d36943ccdb", // New York
  "8ea5d008-6641-49cc-b0d2-51179bdd779b": "4ec2f15e-1479-447b-a89a-725192b162b9", // St Petersburg
  "a77a8a16-eaf3-41fe-a99b-9bb592d8da4d": "9a05fc1d-19b7-457c-a342-0f5efcb2a9dd", // Toronto
  "21b085a9-a438-4fad-a908-c5e4c48deeb0": "1dde0ee0-648f-4786-94f4-39811a282483", // Montreal
  "de4b1cee-c5f3-48a7-948f-03d9a73fbf86": "4ee9e2f5-dbc6-465a-aebe-d8361057a054", // Shanghai
  "4317e5c1-0304-4133-aa26-124ac8400c57": "e30e62b4-e6ff-49c8-a13a-eb1c81b8090e", // Hong Kong
  "ed8e3c49-12c1-43aa-a2f5-de07a5d15443": "47a7b160-c44f-4581-ba3a-46603dacb24d", // Singapore
  "b2e86af6-dfa1-4cc7-a07d-38b9966f0d24": "365133cd-b5c4-4b46-89c2-6c1fc70057e1", // Kuala Lumpur
  "9571469b-078b-4b1d-9054-0362aa7899e0": "0ed262d1-6f84-4035-9919-5102df3a760d", // Sydney
  "1fa14cdc-e95e-4540-a421-6a4bc4551938": "875bf7d0-73f6-448c-96d8-7a8eac701eb0", // Melbourne
  "bd890e1d-4fbe-4e3a-9249-2ca3cefb5c18": "f0af26f0-37b2-4383-8ac4-8ec9bfb52086", // Auckland
  "eef26ab0-d961-4470-958e-afde7b1e58db": "e2dfe7a7-1b21-4e3d-bda7-f1babbd77949", // Germiston
};

/**
 * Helper to get OfficeCity by chatId.
 */
export function getCityByChatId(chatId: string, citiesByRegion: RegionCities[]): OfficeCity | undefined {
  for (const region of citiesByRegion) {
    for (const city of region.cities) {
      if (cityChatIdMap[city.id] === chatId) {
        return { ...city, chatId };
      }
    }
  }
}

/**
 * Returns the local image path for a city.
 */
export function getCityImagePath(cityName: string): any {
  switch (cityName) {
    case "London": return require("@assets/images/city-icons/london.svg");
    case "Tokyo": return require("@assets/images/city-icons/tokyo.svg");
    case "Singapore": return require("@assets/images/city-icons/singapore.svg");
    case "Hong Kong": return require("@assets/images/city-icons/hong-kong.svg");
    default: return require("@assets/images/city-icons/london.svg");
  }
}

/**
 * Returns the corresponding city chat ID for a given city ID.
 */
export function getChatIdByCityId(cityId: string): string | undefined {
  return cityChatIdMap[cityId];
}
