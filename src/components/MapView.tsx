"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { Plant } from "@/types/plant";

interface MapViewProps {
  plants: Plant[];
  selectedId: string | null;
  onSelectPlant: (id: string) => void;
  userCoords?: { lat: number; lng: number } | null;
}

export default function MapView({ plants, selectedId, onSelectPlant, userCoords }: MapViewProps) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      leafletRef.current = L;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [39.045, -76.641],
        zoom: 8,
        zoomControl: false,
      });

      // Standard OpenStreetMap light tiles
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
      renderMarkers(L, map);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !leafletRef.current) return;
    renderMarkers(leafletRef.current, mapRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plants]);

  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const plant = plants.find((p) => p.id === selectedId);
    if (plant) {
      mapRef.current.setView([plant.latitude, plant.longitude], 13, { animate: true });
      markersRef.current.get(selectedId)?.openPopup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (!mapRef.current || !leafletRef.current || !userCoords) return;
    const L = leafletRef.current;
    const icon = L.divIcon({
      className: "",
      html: `<div style="width:14px;height:14px;background:#3b82f6;border:2.5px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(59,130,246,0.25),0 2px 8px rgba(0,0,0,0.4);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    L.marker([userCoords.lat, userCoords.lng], { icon })
      .addTo(mapRef.current)
      .bindPopup("<div style='font-size:12px;padding:4px 2px'>📍 Your Location</div>");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoords]);

  function renderMarkers(L: any, map: any) {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    plants.forEach((plant) => {
      const isOpen = plant.isOpen;
      const color = isOpen ? "#16a34a" : "#dc2626";

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35))">
            <svg width="26" height="36" viewBox="0 0 26 36" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 0C5.82 0 0 5.82 0 13c0 8.67 13 23 13 23S26 21.67 26 13C26 5.82 20.18 0 13 0z" fill="${color}"/>
              <circle cx="13" cy="13" r="6" fill="white" opacity="0.95"/>
            </svg>
          </div>`,
        iconSize: [26, 36],
        iconAnchor: [13, 36],
        popupAnchor: [0, -38],
      });

      const servicesList = plant.services.slice(0, 3)
        .map(s => `<span style="display:inline-block;padding:2px 7px;border-radius:4px;font-size:10px;background:#f1f5f9;color:#475569;margin:1px 1px 0 0;">${s}</span>`)
        .join("");
      const moreServices = plant.services.length > 3
        ? `<span style="font-size:10px;color:#94a3b8;">+${plant.services.length - 3} more</span>`
        : "";

      const popup = L.popup({ maxWidth: 260 }).setContent(`
        <div style="font-family:system-ui,sans-serif;padding:12px 14px;">
          <div style="margin-bottom:8px;">
            <span style="
              display:inline-flex;align-items:center;gap:4px;
              padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;
              background:${isOpen ? "#dcfce7" : "#fee2e2"};
              color:${isOpen ? "#15803d" : "#b91c1c"};
            ">
              <span style="width:5px;height:5px;border-radius:50%;background:${isOpen ? "#16a34a" : "#dc2626"};display:inline-block;"></span>
              ${isOpen ? "OPEN" : "CLOSED"}
            </span>
          </div>
          <div style="font-weight:700;font-size:14px;color:#0f172a;margin-bottom:3px;line-height:1.3;">${plant.name}</div>
          <div style="font-size:11px;color:#64748b;margin-bottom:6px;">${plant.address}</div>
          ${plant.statusText ? `<div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">${plant.statusText}</div>` : ""}
          <div style="margin-bottom:8px;">${servicesList}${moreServices}</div>
          ${plant.phone ? `<div style="font-size:11px;margin-bottom:8px;"><a href="tel:${plant.phone}" style="color:#f59e0b;text-decoration:none;font-weight:600;">${plant.phone}</a></div>` : ""}
          <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(plant.address)}"
            target="_blank" rel="noopener"
            style="display:flex;align-items:center;justify-content:center;gap:6px;background:#f59e0b;color:#0e0f11;text-decoration:none;padding:7px;border-radius:8px;font-size:12px;font-weight:700;">
            🧭 Get Directions
          </a>
        </div>
      `);

      const marker = L.marker([plant.latitude, plant.longitude], { icon })
        .addTo(map)
        .bindPopup(popup)
        .on("click", () => onSelectPlant(plant.id));

      markersRef.current.set(plant.id, marker);
    });
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "300px" }} />
  );
}
