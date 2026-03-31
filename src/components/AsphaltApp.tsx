"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Plant } from "@/types/plant";
import { enrichPlants } from "@/lib/utils";
import { fetchPlants } from "@/lib/actions";
import PlantList from "./PlantList";
import PlantDetail from "./PlantDetail";
import Toolbar from "./Toolbar";
import { ChevronUp, ChevronDown, X } from "lucide-react";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-sm" style={{ background: "var(--asphalt)", color: "var(--text-muted)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--asphalt-border)", borderTopColor: "var(--amber)" }} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>LOADING MAP…</span>
      </div>
    </div>
  ),
});

type BottomSheetState = "peek" | "half" | "full";

export default function AsphaltApp() {
  const [rawPlants, setRawPlants] = useState<Plant[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Mobile bottom sheet state
  const [sheetState, setSheetState] = useState<BottomSheetState>("peek");
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
    if (rawPlants.length > 0) setPlants(enrichPlants(rawPlants, userCoords ?? undefined));
  }, [userCoords, rawPlants]);

  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      if (rawPlants.length > 0) setPlants(enrichPlants(rawPlants, userCoords ?? undefined));
    }, 60_000);
    return () => { if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current); };
  }, [rawPlants, userCoords]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) { alert("Geolocation is not supported."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setLocating(false);
        const enriched = enrichPlants(rawPlants, coords);
        const openPlants = enriched.filter((p) => p.isOpen);
        if (openPlants.length === 0) { alert("No plants are open right now."); return; }
        const closest = openPlants.reduce((a, b) => (a.distance ?? Infinity) < (b.distance ?? Infinity) ? a : b);
        setSelectedId(closest.id);
        setSidebarOpen(true);
        setSheetState("half");
      },
      (err) => { setLocating(false); alert(`Could not get location: ${err.message}`); }
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

  // Bottom sheet height map
  const sheetHeights: Record<BottomSheetState, string> = {
    peek: "88px",
    half: "55vh",
    full: "88vh",
  };

  const cycleSheet = () => {
    setSheetState(s => s === "peek" ? "half" : s === "half" ? "full" : "peek");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--asphalt)" }}>
      <Toolbar
        onLocate={handleLocate}
        onRefresh={handleRefresh}
        onToggleSidebar={() => setSidebarOpen(v => !v)}
        sidebarOpen={sidebarOpen}
        locating={locating}
        refreshing={refreshing}
        openCount={openCount}
        totalCount={plants.length}
      />

      {/* ── Desktop layout ── */}
      <div className="hidden sm:flex flex-1 overflow-hidden">
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
                  <div className="px-3 py-2.5 shrink-0" style={{ borderBottom: "1px solid var(--asphalt-border)" }}>
                    <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
                      {userCoords ? "Sorted by distance" : "Sorted by status"}
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <PlantList plants={sortedPlants} selectedId={selectedId} onSelectPlant={id => setSelectedId(id)} loading={loading} initialVisible={6} />
                  </div>
                </>
              )}
            </>
          )}
        </div>
        {/* Map */}
        <div className="flex-1 relative">
          <MapView plants={plants} selectedId={selectedId} onSelectPlant={id => { setSelectedId(id); setSidebarOpen(true); }} userCoords={userCoords} />
        </div>
      </div>

      {/* ── Mobile layout: map + bottom sheet ── */}
      <div className="flex sm:hidden flex-1 relative overflow-hidden">
        {/* Full-screen map */}
        <div className="absolute inset-0">
          <MapView
            plants={plants}
            selectedId={selectedId}
            onSelectPlant={id => { setSelectedId(id); setSheetState("half"); }}
            userCoords={userCoords}
          />
        </div>

        {/* Bottom sheet */}
        <div
          className="absolute bottom-0 left-0 right-0 flex flex-col rounded-t-2xl overflow-hidden"
          style={{
            height: sheetHeights[sheetState],
            background: "var(--asphalt-mid)",
            borderTop: "1px solid var(--asphalt-border)",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.5)",
            transition: "height 0.28s cubic-bezier(0.32,0.72,0,1)",
            zIndex: 500,
          }}
        >
          {/* Drag handle + header */}
          <div
            className="shrink-0 flex items-center px-4 cursor-pointer select-none"
            style={{ height: "44px", borderBottom: sheetState !== "peek" ? "1px solid var(--asphalt-border)" : "none" }}
            onClick={cycleSheet}
          >
            {/* Drag pill */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2 w-9 h-1 rounded-full" style={{ background: "var(--asphalt-border)" }} />

            {/* Peek: show summary */}
            {sheetState === "peek" && !selectedPlant && (
              <div className="flex items-center gap-2 mt-1 w-full">
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}>
                  {plants.length} PLANTS
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
                  {openCount} open
                </span>
                <ChevronUp size={15} className="ml-auto" style={{ color: "var(--text-muted)" }} />
              </div>
            )}

            {/* Peek: selected plant */}
            {sheetState === "peek" && selectedPlant && (
              <div className="flex items-center gap-2 mt-1 w-full">
                <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)", fontFamily: "'Barlow', sans-serif" }}>
                  {selectedPlant.name}
                </span>
                <ChevronUp size={15} className="ml-auto shrink-0" style={{ color: "var(--text-muted)" }} />
              </div>
            )}

            {/* Half/full: list header or detail header */}
            {sheetState !== "peek" && (
              <div className="flex items-center gap-2 mt-1 w-full">
                {selectedPlant ? (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedId(null); }}
                      className="flex items-center justify-center w-6 h-6 rounded-lg"
                      style={{ color: "var(--text-muted)", background: "var(--asphalt-surface)" }}
                    >
                      <X size={12} />
                    </button>
                    <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)", fontFamily: "'Barlow', sans-serif" }}>
                      {selectedPlant.name}
                    </span>
                  </>
                ) : (
                  <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
                    {userCoords ? "Sorted by distance" : "Sorted by status"}
                  </span>
                )}
                <ChevronDown size={15} className="ml-auto shrink-0" style={{ color: "var(--text-muted)" }} />
              </div>
            )}
          </div>

          {/* Sheet content */}
          {sheetState !== "peek" && (
            <div className="flex-1 overflow-y-auto">
              {selectedPlant ? (
                // Show detail without its own header (header is in the sheet handle above)
                <div className="px-4 py-3 space-y-4">
                  <PlantDetailBody plant={selectedPlant} />
                </div>
              ) : (
                <PlantList
                  plants={sortedPlants}
                  selectedId={selectedId}
                  onSelectPlant={id => { setSelectedId(id); setSheetState("half"); }}
                  loading={loading}
                  initialVisible={4}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline detail body for mobile sheet (no outer wrapper needed)
function PlantDetailBody({ plant }: { plant: Plant }) {
  const { getFullSchedule } = require("@/lib/utils");
  const schedule = getFullSchedule(plant.hours);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(plant.address)}`;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="space-y-4">
      {/* Status + address */}
      <div>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-2"
          style={{
            background: plant.isOpen ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
            color: plant.isOpen ? "#4ade80" : "#f87171",
            border: `1px solid ${plant.isOpen ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"}`,
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: "0.06em",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: plant.isOpen ? "#4ade80" : "#f87171", display: "inline-block" }} />
          {plant.statusText}
        </span>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{plant.address}</p>
        {plant.distance != null && <p className="text-xs mt-0.5" style={{ color: "var(--amber)" }}>{plant.distance.toFixed(1)} miles away</p>}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        {plant.phone && (
          <a href={`tel:${plant.phone}`} className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--asphalt-surface)", border: "1px solid var(--asphalt-border)", color: "var(--text-primary)" }}>
            📞 Call
          </a>
        )}
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
          style={{ background: "var(--amber)", color: "#0e0f11" }}>
          🧭 Directions
        </a>
      </div>

      {/* Services */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>Services</p>
        <div className="flex flex-wrap gap-1.5">
          {plant.services.map(s => (
            <span key={s} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: "var(--asphalt-surface)", border: "1px solid var(--asphalt-border)", color: "var(--text-secondary)" }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Hours */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>Hours</p>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--asphalt-border)" }}>
          {schedule.map(({ day, hours }: { day: string; hours: string }) => (
            <div key={day} className="flex justify-between px-3 py-2 text-xs" style={{ background: day === today ? "var(--asphalt-hover)" : "transparent", borderBottom: "1px solid var(--asphalt-border)" }}>
              <span style={{ color: day === today ? "var(--amber)" : "var(--text-secondary)", fontWeight: day === today ? 600 : 400 }}>{day}</span>
              <span style={{ color: hours === "Closed" ? "var(--text-muted)" : "var(--text-secondary)" }}>{hours}</span>
            </div>
          ))}
        </div>
      </div>

      {plant.notes && (
        <div>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>Notes</p>
          <p className="text-xs leading-relaxed rounded-xl p-3 italic" style={{ background: "var(--asphalt-surface)", border: "1px solid var(--asphalt-border)", color: "var(--text-secondary)" }}>{plant.notes}</p>
        </div>
      )}
    </div>
  );
}
