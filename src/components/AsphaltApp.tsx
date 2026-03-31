"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Plant } from "@/types/plant";
import { enrichPlants } from "@/lib/utils";
import { fetchPlants } from "@/lib/actions";
import PlantList from "./PlantList";
import PlantDetail from "./PlantDetail";
import Toolbar from "./Toolbar";
import { ChevronDown, ChevronUp, X } from "lucide-react";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: "#e5e7eb" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#d1d5db", borderTopColor: "#f59e0b" }} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", color: "#6b7280", fontSize: "13px" }}>
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
  const [isMobile, setIsMobile] = useState(false);
  // Mobile: is the list panel expanded or collapsed?
  const [listExpanded, setListExpanded] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
    if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setLocating(false);
        const enriched = enrichPlants(rawPlants, coords);
        const open = enriched.filter(p => p.isOpen);
        if (!open.length) { alert("No plants are open right now."); return; }
        const closest = open.reduce((a, b) =>
          (a.distance ?? Infinity) < (b.distance ?? Infinity) ? a : b
        );
        setSelectedId(closest.id);
        setSidebarOpen(true);
        setListExpanded(true);
      },
      (err) => { setLocating(false); alert(`Could not get location: ${err.message}`); }
    );
  }, [rawPlants]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPlants();
  }, [loadPlants]);

  const selectedPlant = plants.find(p => p.id === selectedId) ?? null;
  const openCount = plants.filter(p => p.isOpen).length;
  const sortedPlants = [...plants].sort((a, b) => {
    if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
    if (a.distance != null && b.distance != null) return a.distance - b.distance;
    return a.name.localeCompare(b.name);
  });

  const toolbar = (
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
  );

  // ── Mobile: vertical stack — toolbar / list panel / map ──
  if (isMobile) {
    return (
      <div
        className="flex flex-col"
        style={{ height: "100dvh", background: "var(--asphalt)", overflow: "hidden" }}
      >
        {/* 1. Toolbar — always visible at top */}
        {toolbar}

        {/* 2. Plant list panel — collapsible */}
        <div
          style={{
            background: "var(--asphalt-mid)",
            borderBottom: "1px solid var(--asphalt-border)",
            flexShrink: 0,
            overflow: "hidden",
            transition: "max-height 0.25s ease",
            maxHeight: listExpanded ? "52vh" : "0px",
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center px-3 cursor-pointer select-none"
            style={{ height: "40px", borderBottom: "1px solid var(--asphalt-border)" }}
            onClick={() => setListExpanded(v => !v)}
          >
            {selectedPlant ? (
              <>
                <button
                  onClick={e => { e.stopPropagation(); setSelectedId(null); }}
                  className="flex items-center justify-center rounded-md mr-2 shrink-0"
                  style={{ width: "22px", height: "22px", background: "var(--asphalt-surface)", color: "var(--text-muted)" }}
                >
                  <X size={11} />
                </button>
                <span
                  className="text-sm font-semibold truncate flex-1"
                  style={{ color: "var(--text-primary)", fontFamily: "'Barlow', sans-serif" }}
                >
                  {selectedPlant.name}
                </span>
              </>
            ) : (
              <span
                className="text-xs uppercase flex-1"
                style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}
              >
                {userCoords ? "Sorted by distance" : "Sorted by status"} · {plants.length} plants
              </span>
            )}
            {listExpanded
              ? <ChevronUp size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              : <ChevronDown size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            }
          </div>

          {/* Scrollable list or detail */}
          <div style={{ overflowY: "auto", maxHeight: "calc(52vh - 40px)" }}>
            {selectedPlant ? (
              <div className="px-4 py-3">
                <MobilePlantDetail plant={selectedPlant} />
              </div>
            ) : (
              <PlantList
                plants={sortedPlants}
                selectedId={selectedId}
                onSelectPlant={id => { setSelectedId(id); }}
                loading={loading}
                initialVisible={4}
              />
            )}
          </div>
        </div>

        {/* Collapsed strip — tap to re-open list */}
        {!listExpanded && (
          <div
            className="flex items-center justify-between px-3 cursor-pointer select-none shrink-0"
            style={{
              height: "36px",
              background: "var(--asphalt-mid)",
              borderBottom: "1px solid var(--asphalt-border)",
            }}
            onClick={() => setListExpanded(true)}
          >
            <span
              className="text-xs uppercase"
              style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}
            >
              {plants.length} plants · {openCount} open
            </span>
            <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
          </div>
        )}

        {/* 3. Map — fills remaining space */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <MapView
            plants={plants}
            selectedId={selectedId}
            onSelectPlant={id => { setSelectedId(id); setListExpanded(true); }}
            userCoords={userCoords}
          />
        </div>
      </div>
    );
  }

  // ── Desktop: sidebar + map side by side ──
  return (
    <div
      className="flex flex-col"
      style={{ height: "100dvh", background: "var(--asphalt)", overflow: "hidden" }}
    >
      {toolbar}
      <div className="flex flex-1" style={{ minHeight: 0 }}>
        {/* Sidebar */}
        <div
          className="flex flex-col shrink-0 overflow-hidden transition-all duration-200"
          style={{
            width: sidebarOpen ? "300px" : "0px",
            background: "var(--asphalt-mid)",
            borderRight: "1px solid var(--asphalt-border)",
          }}
        >
          {sidebarOpen && (
            selectedPlant ? (
              <PlantDetail plant={selectedPlant} onClose={() => setSelectedId(null)} />
            ) : (
              <>
                <div
                  className="px-3 py-2.5 shrink-0"
                  style={{ borderBottom: "1px solid var(--asphalt-border)" }}
                >
                  <p
                    className="text-xs uppercase"
                    style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}
                  >
                    {userCoords ? "Sorted by distance" : "Sorted by status"}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <PlantList
                    plants={sortedPlants}
                    selectedId={selectedId}
                    onSelectPlant={id => setSelectedId(id)}
                    loading={loading}
                    initialVisible={6}
                  />
                </div>
              </>
            )
          )}
        </div>

        {/* Map */}
        <div className="flex-1">
          <MapView
            plants={plants}
            selectedId={selectedId}
            onSelectPlant={id => { setSelectedId(id); setSidebarOpen(true); }}
            userCoords={userCoords}
          />
        </div>
      </div>
    </div>
  );
}

function MobilePlantDetail({ plant }: { plant: Plant }) {
  const { getFullSchedule } = require("@/lib/utils");
  const schedule: { day: string; hours: string }[] = getFullSchedule(plant.hours);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(plant.address)}`;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="space-y-4 pb-4">
      <div>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{
            background: plant.isOpen ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
            color: plant.isOpen ? "#4ade80" : "#f87171",
            border: `1px solid ${plant.isOpen ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"}`,
            fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: plant.isOpen ? "#4ade80" : "#f87171", display: "inline-block" }} />
          {plant.statusText}
        </span>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{plant.address}</p>
        {plant.distance != null && (
          <p className="text-xs mt-0.5" style={{ color: "var(--amber)" }}>{plant.distance.toFixed(1)} miles away</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {plant.phone ? (
          <a href={`tel:${plant.phone}`}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--asphalt-surface)", border: "1px solid var(--asphalt-border)", color: "var(--text-primary)" }}>
            📞 Call
          </a>
        ) : <div />}
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
          style={{ background: "var(--amber)", color: "#0e0f11" }}>
          🧭 Directions
        </a>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>Services</p>
        <div className="flex flex-wrap gap-1.5">
          {plant.services.map(s => (
            <span key={s} className="px-2.5 py-1 rounded-lg text-xs"
              style={{ background: "var(--asphalt-surface)", border: "1px solid var(--asphalt-border)", color: "var(--text-secondary)" }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>Hours</p>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--asphalt-border)" }}>
          {schedule.map(({ day, hours }) => (
            <div key={day} className="flex justify-between px-3 py-2 text-xs"
              style={{ background: day === today ? "var(--asphalt-hover)" : "transparent", borderBottom: "1px solid var(--asphalt-border)" }}>
              <span style={{ color: day === today ? "var(--amber)" : "var(--text-secondary)", fontWeight: day === today ? 600 : 400 }}>{day}</span>
              <span style={{ color: hours === "Closed" ? "var(--text-muted)" : "var(--text-secondary)" }}>{hours}</span>
            </div>
          ))}
        </div>
      </div>

      {plant.notes && (
        <div>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>Notes</p>
          <p className="text-xs leading-relaxed rounded-xl p-3 italic"
            style={{ background: "var(--asphalt-surface)", border: "1px solid var(--asphalt-border)", color: "var(--text-secondary)" }}>
            {plant.notes}
          </p>
        </div>
      )}
    </div>
  );
}
