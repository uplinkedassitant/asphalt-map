"use client";

import { useEffect, useRef } from "react";
import { Plant } from "@/types/plant";

interface MapViewProps {
  plants: Plant[];
  selectedId: string | null;
  onSelectPlant: (id: string) => void;
  userCoords?: { lat: number; lng: number } | null;
}

export default function MapView({
  plants,
  selectedId,
  onSelectPlant,
  userCoords,
}: MapViewProps) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapRef.current) return; // already initialized

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      leafletRef.current = L;

      // Fix default icon paths (common Next.js issue)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [39.75, -89.67],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

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

  // Re-render markers when plants change
  useEffect(() => {
    if (!mapRef.current || !leafletRef.current) return;
    renderMarkers(leafletRef.current, mapRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plants]);

  // Pan to selected plant
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const plant = plants.find((p) => p.id === selectedId);
    if (plant) {
      mapRef.current.setView([plant.latitude, plant.longitude], 14, {
        animate: true,
      });
      markersRef.current.get(selectedId)?.openPopup();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Show user location marker
  useEffect(() => {
    if (!mapRef.current || !leafletRef.current || !userCoords) return;
    const L = leafletRef.current;
    const userIcon = L.divIcon({
      className: "",
      html: `<div style="
        width:16px;height:16px;background:#3b82f6;border:3px solid white;
        border-radius:50%;box-shadow:0 0 0 3px rgba(59,130,246,0.3);
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
      .addTo(mapRef.current)
      .bindPopup("📍 Your Location");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoords]);

  function renderMarkers(L: any, map: any) {
    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    plants.forEach((plant) => {
      const color = plant.isOpen ? "#22c55e" : "#ef4444";
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;">
            <svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z"
                fill="${color}" stroke="white" stroke-width="2"/>
              <circle cx="14" cy="14" r="5" fill="white" opacity="0.9"/>
            </svg>
          </div>`,
        iconSize: [28, 40],
        iconAnchor: [14, 40],
        popupAnchor: [0, -42],
      });

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(plant.address)}`;
      const servicesList = plant.services.map((s) => `<li>${s}</li>`).join("");

      const popup = L.popup({ maxWidth: 280, className: "plant-popup" }).setContent(`
        <div style="font-family:system-ui,sans-serif;padding:4px 2px;">
          <div style="font-weight:700;font-size:15px;margin-bottom:4px;color:#111;">${plant.name}</div>
          <div style="font-size:12px;color:#555;margin-bottom:8px;">${plant.address}</div>
          <div style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;
            background:${plant.isOpen ? "#dcfce7" : "#fee2e2"};
            color:${plant.isOpen ? "#15803d" : "#b91c1c"};
            margin-bottom:8px;">
            ${plant.statusText}
          </div>
          <div style="font-size:12px;color:#374151;margin-bottom:6px;">
            <strong>Services:</strong>
            <ul style="margin:4px 0 0 16px;padding:0;">${servicesList}</ul>
          </div>
          ${plant.phone ? `<div style="font-size:12px;margin-bottom:4px;">📞 <a href="tel:${plant.phone}" style="color:#2563eb;">${plant.phone}</a></div>` : ""}
          ${plant.notes ? `<div style="font-size:11px;color:#6b7280;font-style:italic;margin-bottom:6px;">${plant.notes}</div>` : ""}
          <a href="${directionsUrl}" target="_blank" rel="noopener"
            style="display:block;text-align:center;background:#1d4ed8;color:white;text-decoration:none;
            padding:6px;border-radius:6px;font-size:12px;font-weight:600;margin-top:4px;">
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
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
      className="z-0"
    />
  );
}
