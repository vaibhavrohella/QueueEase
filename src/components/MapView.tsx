import { useEffect, useRef } from "react";
import { loadLeaflet } from "@/lib/leafletLoader";

type MapShop = {
  id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
};

type Props = {
  shops: MapShop[];
  userCoords: { lat: number; lng: number } | null;
  height?: number;
};

const MapView = ({ shops, userCoords, height = 320 }: Props) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    let destroyed = false;
    loadLeaflet()
      .then((L) => {
        if (destroyed || !mapRef.current) return;
        if (!leafletMapRef.current) {
          const center = userCoords
            ? [userCoords.lat, userCoords.lng]
            : shops.find((s) => s.latitude != null && s.longitude != null)
              ? [Number(shops[0].latitude), Number(shops[0].longitude)]
              : [0, 0];

          leafletMapRef.current = L.map(mapRef.current).setView(center as any, userCoords ? 13 : 2);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
          }).addTo(leafletMapRef.current);
        }

        const map = leafletMapRef.current;

        // Clear existing markers layer group if present
        if ((map as any)._shopLayer) {
          (map as any)._shopLayer.clearLayers();
        } else {
          (map as any)._shopLayer = L.layerGroup().addTo(map);
        }

        const group = (map as any)._shopLayer;

        // User marker
        if (userCoords) {
          const m = L.marker([userCoords.lat, userCoords.lng], { title: "You" });
          m.bindPopup("You are here");
          group.addLayer(m);
        }

        // Shop markers
        const bounds = L.latLngBounds([] as any);
        if (userCoords) bounds.extend([userCoords.lat, userCoords.lng]);

        shops.forEach((s) => {
          if (s.latitude != null && s.longitude != null) {
            const lat = Number(s.latitude);
            const lng = Number(s.longitude);
            const marker = L.marker([lat, lng], { title: s.name });
            marker.bindPopup(`<strong>${s.name}</strong>`);
            group.addLayer(marker);
            bounds.extend([lat, lng]);
          }
        });

        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.2));
        }
      })
      .catch(() => {
        // Ignore map load errors in UI
      });

    return () => {
      destroyed = true;
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch {}
        leafletMapRef.current = null;
      }
    };
  }, [shops, userCoords]);

  return (
    <div className="rounded-lg border overflow-hidden" style={{ height }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

export default MapView;


