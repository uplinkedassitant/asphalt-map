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
    <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--surface-mid)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--border)", borderTopColor: "var(--amber)" }} />
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", color: "var(--text-muted)", fontSize: "13px" }}>
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
  const [listExpanded, setListExpanded] = useState(true);
  const [fitBoundsTo, setFitBoundsTo] = useState<{lat:number;lng:number}[]|null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Apply dark mode to <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

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
        // Fit map to show both user and closest plant
        setFitBoundsTo([coords, { lat: closest.latitude, lng: closest.longitude }]);
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
      darkMode={darkMode}
      onToggleDark={() => setDarkMode(v => !v)}
    />
  );

  // ── Mobile layout ──
  if (isMobile) {
    // List panel is ~38vh when expanded, giving map ~62vh minus toolbar
    const LIST_HEIGHT = "38vh";

    return (
      <div className="flex flex-col" style={{ height: "100dvh", background: "var(--bg)", overflow: "hidden" }}>
        {toolbar}

        {/* Plant list panel */}
        <div style={{
          background: "var(--surface-mid)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          overflow: "hidden",
          transition: "max-height 0.25s ease",
          maxHeight: listExpanded ? LIST_HEIGHT : "0px",
        }}>
          {/* Panel header */}
          <div
            className="flex items-center px-3 cursor-pointer select-none"
            style={{ height: "40px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}
            onClick={() => setListExpanded(v => !v)}
          >
            {selectedPlant ? (
              <>
                <button
                  onClick={e => { e.stopPropagation(); setSelectedId(null); }}
                  className="flex items-center justify-center rounded-md mr-2 shrink-0"
                  style={{ width: "22px", height: "22px", background: "var(--hover)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                >
                  <X size={11} />
                </button>
                <span className="text-sm font-semibold truncate flex-1"
                  style={{ color: "var(--text-primary)", fontFamily: "'Barlow', sans-serif" }}>
                  {selectedPlant.name}
                </span>
              </>
            ) : (
              <span className="text-xs uppercase flex-1"
                style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
                {userCoords ? "Sorted by distance" : "Sorted by status"} · {plants.length} plants
              </span>
            )}
            {listExpanded
              ? <ChevronUp size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              : <ChevronDown size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            }
          </div>

          <div style={{ overflowY: "auto", maxHeight: `calc(${LIST_HEIGHT} - 40px)` }}>
            {selectedPlant ? (
              <div className="px-4 py-3">
                <MobilePlantDetail plant={selectedPlant} />
              </div>
            ) : (
              <PlantList
                plants={sortedPlants}
                selectedId={selectedId}
                onSelectPlant={id => setSelectedId(id)}
                loading={loading}
                initialVisible={4}
              />
            )}
          </div>
        </div>

        {/* Collapsed strip */}
        {!listExpanded && (
          <div
            className="flex items-center justify-between px-3 cursor-pointer select-none shrink-0"
            style={{ height: "36px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
            onClick={() => setListExpanded(true)}
          >
            <span className="text-xs uppercase"
              style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
              {plants.length} plants · {openCount} open — tap to expand
            </span>
            <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
          </div>
        )}

        {/* Divider + map wrapper — full-width separator, map padded with rounded corners */}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "var(--border)", gap: "8px", paddingTop: "6px" }}>
        <div style={{ flex: 1, minHeight: 0, margin: "0 8px 8px 8px", borderRadius: "12px", overflow: "hidden" }}>
          <MapView
            plants={plants}
            selectedId={selectedId}
            onSelectPlant={id => { setSelectedId(id); setListExpanded(true); }}
            userCoords={userCoords}
            fitBoundsTo={fitBoundsTo}
          />
        </div>
        </div>
      </div>
    );
  }

  // ── Desktop layout ──
  return (
    <div className="flex flex-col" style={{ height: "100dvh", background: "var(--bg)", overflow: "hidden" }}>
      {toolbar}
      <div className="flex flex-1" style={{ minHeight: 0 }}>
        {/* Sidebar */}
        <div
          className="flex flex-col shrink-0 overflow-hidden transition-all duration-200"
          style={{
            width: sidebarOpen ? "300px" : "0px",
            background: "var(--surface-mid)",
            borderRight: "1px solid var(--border)",
          }}
        >
          {sidebarOpen && (
            selectedPlant ? (
              <PlantDetail plant={selectedPlant} onClose={() => setSelectedId(null)} />
            ) : (
              <>
                <div className="px-3 py-2.5 shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
                  <p className="text-xs uppercase"
                    style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
                    {userCoords ? "Sorted by distance" : "Sorted by status"}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <PlantList plants={sortedPlants} selectedId={selectedId} onSelectPlant={id => setSelectedId(id)} loading={loading} initialVisible={6} />
                </div>
              </>
            )
          )}
        </div>
        {/* Map */}
        <div className="flex-1" style={{ margin: "8px", borderRadius: "12px", overflow: "hidden" }}>
          <MapView plants={plants} selectedId={selectedId} onSelectPlant={id => { setSelectedId(id); setSidebarOpen(true); }} userCoords={userCoords} />
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{
            background: plant.isOpen ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
            color: plant.isOpen ? "#16a34a" : "#dc2626",
            border: `1px solid ${plant.isOpen ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`,
            fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em",
          }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: plant.isOpen ? "#16a34a" : "#dc2626", display: "inline-block" }} />
          {plant.statusText}
        </span>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{plant.address}</p>
        {plant.distance != null && <p className="text-xs mt-0.5 font-semibold" style={{ color: "var(--amber)" }}>{plant.distance.toFixed(1)} miles away</p>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {plant.phone ? (
          <a href={`tel:${plant.phone}`} className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--hover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
            📞 Call
          </a>
        ) : <div />}
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
          style={{ background: "var(--amber)", color: "#fff" }}>
          🧭 Directions
        </a>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>Services</p>
        <div className="flex flex-wrap gap-1.5">
          {plant.services.map(s => (
            <span key={s} className="px-2.5 py-1 rounded-lg text-xs"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>{s}</span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>Hours</p>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {schedule.map(({ day, hours }: { day: string; hours: string }) => (
            <div key={day} className="flex justify-between px-3 py-2 text-xs"
              style={{ background: day === today ? "var(--hover)" : "var(--surface)", borderBottom: "1px solid var(--border)" }}>
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
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>{plant.notes}</p>
        </div>
      )}
    </div>
  );
}
