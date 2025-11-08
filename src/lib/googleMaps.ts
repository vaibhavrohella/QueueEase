let mapsApiLoadingPromise: Promise<typeof google.maps> | null = null;

export function loadGoogleMapsApi(): Promise<typeof google.maps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is undefined"));
  }

  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve((window as any).google.maps);
  }

  if (mapsApiLoadingPromise) {
    return mapsApiLoadingPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!apiKey) {
    return Promise.reject(new Error("Missing VITE_GOOGLE_MAPS_API_KEY"));
  }

  mapsApiLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).google && (window as any).google.maps) {
        resolve((window as any).google.maps);
      } else {
        reject(new Error("Google Maps failed to load"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });

  return mapsApiLoadingPromise;
}


