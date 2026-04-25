export type OfficeCity = {
  id: string;
  name: string;
  countryCode?: string;
  imagePath?: string;
  chatId?: string;
};

export type RegionCities = {
  region: string;
  cities: OfficeCity[];
};

export type OfficeCitySelection = {
  region: string;
  city: OfficeCity;
};
