"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Plant } from "@/types/plant";
import { enrichPlants } from "@/lib/utils";
import { fetchPlants } from "@/lib/actions";
import PlantList from "./PlantList";
import PlantDetail from "./PlantDetail";
import Toolbar from "./Toolbar";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div
      className="flex-1 flex items-center justify-center text-sm"
      style={{ background: "var(--asphalt)", color: "var(--text-muted)" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--asphalt-border)", borderTopColor: "var(--amber)" }}
        />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
          LOADING MAP…
        </span>
      </div>
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

  useEffect(() => { loadPlants(); }, []); // eslint-disable-line

  useEffect(() => {
    if (rawPlants.length > 0) {
      setPlants(enrichPlants(rawPlants, userCoords ?? undefined));
    }
  }, [userCoords, rawPlants]);

  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      if (rawPlants.length > 0) {
        setPlants(enrichPlants(rawPlants, userCoords ?? undefined));
      }
    }, 60_000);
    return () => { if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current); };
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

  const sortedPlants = [...plants].sort((a, b) => {
    if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
    if (a.distance != null && b.distance != null) return a.distance - b.distance;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--asphalt)" }}>
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
          className="flex flex-col overflow-hidden transition-all duration-200"
          style={{
            width: sidebarOpen ? "300px" : "0px",
            minWidth: sidebarOpen ? "300px" : "0px",
            background: "var(--asphalt-mid)",
            borderRight: "1px solid var(--asphalt-border)",
          }}
        >
          {sidebarOpen && (
            <>
              {selectedPlant ? (
                <PlantDetail plant={selectedPlant} onClose={() => setSelectedId(null)} />
              ) : (
                <>
                  {/* Sidebar header */}
                  <div
                    className="px-3 py-2.5 shrink-0"
                    style={{ borderBottom: "1px solid var(--asphalt-border)" }}
                  >
                    <p
                      className="text-xs uppercase tracking-widest"
                      style={{
                        color: "var(--text-muted)",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {userCoords ? "Sorted by distance" : "Sorted by status"}
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <PlantList
                      plants={sortedPlants}
                      selectedId={selectedId}
                      onSelectPlant={(id) => setSelectedId(id)}
                      loading={loading}
                    />
                  </div>
                </>
              )}
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
