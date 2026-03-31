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

      // Dark map tiles
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Custom zoom control position
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
      html: `<div style="
        width:14px;height:14px;
        background:#3b82f6;
        border:2.5px solid white;
        border-radius:50%;
        box-shadow:0 0 0 4px rgba(59,130,246,0.25), 0 2px 8px rgba(0,0,0,0.5);
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    L.marker([userCoords.lat, userCoords.lng], { icon })
      .addTo(mapRef.current)
      .bindPopup("<div style='font-family:Barlow,sans-serif;font-size:12px;color:#f1f2f4;padding:4px 2px'>📍 Your Location</div>");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoords]);

  function renderMarkers(L: any, map: any) {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    plants.forEach((plant) => {
      const isOpen = plant.isOpen;
      const color = isOpen ? "#22c55e" : "#6b7280";
      const glowColor = isOpen ? "rgba(34,197,94,0.35)" : "rgba(107,114,128,0.2)";

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.5))">
            <svg width="26" height="36" viewBox="0 0 26 36" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 0C5.82 0 0 5.82 0 13c0 8.67 13 23 13 23S26 21.67 26 13C26 5.82 20.18 0 13 0z"
                fill="${color}" />
              <circle cx="13" cy="13" r="5.5" fill="rgba(255,255,255,0.2)"/>
              <circle cx="13" cy="13" r="3" fill="white" opacity="0.9"/>
            </svg>
          </div>`,
        iconSize: [26, 36],
        iconAnchor: [13, 36],
        popupAnchor: [0, -38],
      });

      const servicesList = plant.services.slice(0, 3).map((s) =>
        `<span style="
          display:inline-block;
          padding:2px 8px;
          border-radius:4px;
          font-size:10px;
          background:rgba(255,255,255,0.07);
          border:1px solid rgba(255,255,255,0.1);
          color:#8b909e;
          margin:1px;
        ">${s}</span>`
      ).join("");

      const moreServices = plant.services.length > 3
        ? `<span style="font-size:10px;color:#555b6a;margin-left:2px;">+${plant.services.length - 3} more</span>`
        : "";

      const popup = L.popup({ maxWidth: 260, className: "plant-popup" }).setContent(`
        <div style="font-family:'Barlow',system-ui,sans-serif;padding:12px 14px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
            <span style="
              display:inline-flex;align-items:center;gap:4px;
              padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;
              letter-spacing:0.06em;font-family:'Barlow Condensed',sans-serif;
              background:${isOpen ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)"};
              color:${isOpen ? "#4ade80" : "#f87171"};
              border:1px solid ${isOpen ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"};
            ">
              <span style="width:5px;height:5px;border-radius:50%;background:${isOpen ? "#4ade80" : "#f87171"};display:inline-block;"></span>
              ${isOpen ? "OPEN" : "CLOSED"}
            </span>
          </div>
          <div style="font-weight:700;font-size:14px;color:#f1f2f4;margin-bottom:3px;line-height:1.3;font-family:'Barlow Condensed',sans-serif;letter-spacing:0.01em;">
            ${plant.name}
          </div>
          <div style="font-size:11px;color:#555b6a;margin-bottom:8px;">${plant.address}</div>
          ${plant.statusText ? `<div style="font-size:11px;color:#8b909e;margin-bottom:8px;">${plant.statusText}</div>` : ""}
          <div style="margin-bottom:8px;">${servicesList}${moreServices}</div>
          ${plant.phone ? `<div style="font-size:11px;margin-bottom:8px;"><a href="tel:${plant.phone}" style="color:#f59e0b;text-decoration:none;">${plant.phone}</a></div>` : ""}
          <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(plant.address)}"
            target="_blank" rel="noopener"
            style="
              display:flex;align-items:center;justify-content:center;gap:6px;
              background:#f59e0b;color:#0e0f11;text-decoration:none;
              padding:7px;border-radius:8px;font-size:12px;font-weight:700;
              font-family:'Barlow',sans-serif;
            ">
            Get Directions
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
      style={{ width: "100%", height: "100%", minHeight: "400px" }}
      className="z-0"
    />
  );
}
