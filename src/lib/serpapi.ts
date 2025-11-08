type SerpApiSearchParams = {
  q: string;
  ll?: string; // e.g., "@40.7455096,-74.0083012,14z"
};

export async function serpSearchGoogleMaps(params: SerpApiSearchParams): Promise<any> {
  const apiKey = import.meta.env.VITE_SERPAPI_KEY as string | undefined;
  if (!apiKey) throw new Error("Missing VITE_SERPAPI_KEY");

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_maps");
  url.searchParams.set("q", params.q);
  if (params.ll) url.searchParams.set("ll", params.ll);
  url.searchParams.set("api_key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`SerpAPI error: ${res.status}`);
  return await res.json();
}

export type LatLng = { lat: number; lng: number };

export async function geocodeAddressWithSerp(address: string, ll?: string): Promise<LatLng | null> {
  const json = await serpSearchGoogleMaps({ q: address, ll });

  // Try place_results first
  const place = json?.place_results;
  if (place?.gps_coordinates) {
    const { latitude, longitude } = place.gps_coordinates;
    if (typeof latitude === "number" && typeof longitude === "number") {
      return { lat: latitude, lng: longitude };
    }
  }

  // Fallback to local_results array
  const local = json?.local_results;
  if (Array.isArray(local) && local.length > 0) {
    for (const item of local) {
      const coords = item?.gps_coordinates;
      if (coords && typeof coords.latitude === "number" && typeof coords.longitude === "number") {
        return { lat: coords.latitude, lng: coords.longitude };
      }
    }
  }

  return null;
}


