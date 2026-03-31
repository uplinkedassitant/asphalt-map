"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Plant } from "@/types/plant";
import { enrichPlants } from "@/lib/utils";
import { fetchPlants } from "@/lib/actions";
import PlantList from "./PlantList";
import PlantDetail from "./PlantDetail";
import Toolbar from "./Toolbar";

// Dynamic import prevents SSR issues with Leaflet
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
      Loading map…
    </div>
  ),
});

export default function AsphaltApp() {
  const [rawPlants, setRawPlants] = useState<Plant[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadPlants = useCallback(async () => {
    const data = await fetchPlants();
    setRawPlants(data);
    setPlants(enrichPlants(data, userCoords ?? undefined));
    setLoading(false);
    setRefreshing(false);
  }, [userCoords]);

  // Initial load
  useEffect(() => {
    loadPlants();
  }, []); // eslint-disable-line

  // Re-enrich when userCoords changes (adds distance)
  useEffect(() => {
    if (rawPlants.length > 0) {
      setPlants(enrichPlants(rawPlants, userCoords ?? undefined));
    }
  }, [userCoords, rawPlants]);

  // Auto-refresh open/closed status every minute
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      if (rawPlants.length > 0) {
        setPlants(enrichPlants(rawPlants, userCoords ?? undefined));
      }
    }, 60_000);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [rawPlants, userCoords]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setLocating(false);

        // Find closest open plant
        const enriched = enrichPlants(rawPlants, coords);
        const openPlants = enriched.filter((p) => p.isOpen);
        if (openPlants.length === 0) {
          alert("No plants are open right now.");
          return;
        }
        const closest = openPlants.reduce((a, b) =>
          (a.distance ?? Infinity) < (b.distance ?? Infinity) ? a : b
        );
        setSelectedId(closest.id);
        setSidebarOpen(true);
      },
      (err) => {
        setLocating(false);
        alert(`Could not get your location: ${err.message}`);
      }
    );
  }, [rawPlants]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPlants();
  }, [loadPlants]);

  const selectedPlant = plants.find((p) => p.id === selectedId) ?? null;
  const openCount = plants.filter((p) => p.isOpen).length;

  // Sort: open first, then by distance if available, then alphabetically
  const sortedPlants = [...plants].sort((a, b) => {
    if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
    if (a.distance != null && b.distance != null) return a.distance - b.distance;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-zinc-100 overflow-hidden">
      <Toolbar
        onLocate={handleLocate}
        onRefresh={handleRefresh}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
        locating={locating}
        refreshing={refreshing}
        openCount={openCount}
        totalCount={plants.length}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`flex flex-col bg-zinc-900 border-r border-zinc-700 transition-all duration-200 overflow-hidden ${
            sidebarOpen ? "w-72 sm:w-80" : "w-0"
          }`}
        >
          {selectedPlant ? (
            <PlantDetail
              plant={selectedPlant}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <>
              <div className="px-4 py-2.5 border-b border-zinc-800">
                <p className="text-xs text-zinc-500 font-medium">
                  {userCoords ? "Sorted by distance" : "Sorted by status, then name"}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <PlantList
                  plants={sortedPlants}
                  selectedId={selectedId}
                  onSelectPlant={(id) => {
                    setSelectedId(id);
                  }}
                  loading={loading}
                />
              </div>
            </>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapView
            plants={plants}
            selectedId={selectedId}
            onSelectPlant={(id) => {
              setSelectedId(id);
              setSidebarOpen(true);
            }}
            userCoords={userCoords}
          />
        </div>
      </div>
    </div>
  );
}
