let leafletLoadingPromise: Promise<typeof window.L> | null = null;

export function loadLeaflet(): Promise<typeof window.L> {
  if (typeof window === "undefined") return Promise.reject(new Error("Window undefined"));
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (leafletLoadingPromise) return leafletLoadingPromise;

  leafletLoadingPromise = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    css.crossOrigin = "";
    document.head.appendChild(css);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.async = true;
    script.onload = () => {
      if ((window as any).L) resolve((window as any).L);
      else reject(new Error("Leaflet failed to load"));
    };
    script.onerror = () => reject(new Error("Failed to load Leaflet"));
    document.head.appendChild(script);
  });

  return leafletLoadingPromise;
}


