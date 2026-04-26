export const MapService = {
  /**
   * Geocodes an address string into latitude and longitude coordinates
   * Returns the most likely match
   * @param address The address to geocode
   * @returns {Promise<{lat: number, lng: number}>}
   */
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!address) { throw new Error("No address provided") }

    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    );

    const json = await response.json();

    if (json.status === 'OK' && json.results.length > 0) {
      return json.results[0].geometry.location;
    } else {
      throw new Error(json.error_message || "No results for address");
    }
  }
};
