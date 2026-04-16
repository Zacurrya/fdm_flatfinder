export type OfficeCity = {
  name: string;
  countryCode: string;
};

export type RegionCities = {
  region: string;
  cities: OfficeCity[];
};

export type OfficeCitySelection = {
  region: string;
  city: OfficeCity;
};

export const fdmOfficeCitiesByRegion: RegionCities[] = [
  {
    region: "Europe",
    cities: [
      { name: "London", countryCode: "GB" },
      { name: "Leeds", countryCode: "GB" },
      { name: "Glasgow", countryCode: "GB" },
      { name: "Brighton", countryCode: "GB" },
      { name: "Frankfurt", countryCode: "DE" },
      { name: "Luxembourg", countryCode: "LU" },
      { name: "Watermael-Boitsfort", countryCode: "BE" },
      { name: "Dublin", countryCode: "IE" },
      { name: "Limerick", countryCode: "IE" },
      { name: "Zurich", countryCode: "CH" },
      { name: "Krakow", countryCode: "PL" },
    ],
  },
  {
    region: "North America",
    cities: [
      { name: "Austin", countryCode: "US" },
      { name: "Charlotte", countryCode: "US" },
      { name: "New York", countryCode: "US" },
      { name: "St Petersburg", countryCode: "US" },
      { name: "Toronto", countryCode: "CA" },
      { name: "Montreal", countryCode: "CA" },
    ],
  },
  {
    region: "Asia",
    cities: [
      { name: "Shanghai", countryCode: "CN" },
      { name: "Hong Kong", countryCode: "HK" },
      { name: "Singapore", countryCode: "SG" },
      { name: "Kuala Lumpur", countryCode: "MY" },
    ],
  },
  {
    region: "Oceania",
    cities: [
      { name: "Sydney", countryCode: "AU" },
      { name: "Melbourne", countryCode: "AU" },
      { name: "Auckland", countryCode: "NZ" },
    ],
  },
  {
    region: "Africa",
    cities: [{ name: "Germiston", countryCode: "ZA" }],
  },
];

export function findOfficeCityByName(cityName: string): OfficeCitySelection | null {
  const normalizedCityName = cityName.trim().toLowerCase();
  if (!normalizedCityName) {
    return null;
  }

  for (const group of fdmOfficeCitiesByRegion) {
    const city = group.cities.find((candidate) => candidate.name.toLowerCase() === normalizedCityName);
    if (city) {
      return { region: group.region, city };
    }
  }

  return null;
}
