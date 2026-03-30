export type RegionCities = {
  region: string;
  cities: string[];
};

export const fdmOfficeCitiesByRegion: RegionCities[] = [
  {
    region: "Europe",
    cities: [
      "London",
      "Leeds",
      "Glasgow",
      "Brighton",
      "Frankfurt",
      "Luxembourg",
      "Watermael-Boitsfort",
      "Dublin",
      "Limerick",
      "Zurich",
      "Krakow",
    ],
  },
  {
    region: "North America",
    cities: ["Austin", "Charlotte", "New York", "St Petersburg", "Toronto", "Montreal"],
  },
  {
    region: "Asia",
    cities: ["Shanghai", "Hong Kong", "Singapore", "Kuala Lumpur"],
  },
  {
    region: "Australasia",
    cities: ["Sydney", "Melbourne", "Auckland"],
  },
  {
    region: "Africa",
    cities: ["Germiston"],
  },
];
