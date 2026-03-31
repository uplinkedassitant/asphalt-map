"use client";

import { MapPin, RefreshCw, ChevronLeft, ChevronRight, Layers } from "lucide-react";

interface ToolbarProps {
  onLocate: () => void;
  onRefresh: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  locating: boolean;
  refreshing: boolean;
  openCount: number;
  totalCount: number;
}

export default function Toolbar({
  onLocate,
  onRefresh,
  onToggleSidebar,
  sidebarOpen,
  locating,
  refreshing,
  openCount,
  totalCount,
}: ToolbarProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 shrink-0 z-10"
      style={{
        background: "var(--asphalt-mid)",
        borderBottom: "1px solid var(--asphalt-border)",
        height: "48px",
      }}
    >
      {/* Sidebar toggle — hidden on mobile (bottom sheet handles it) */}
      <button
        onClick={onToggleSidebar}
        className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--asphalt-hover)"; el.style.color = "var(--text-primary)"; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--text-secondary)"; }}
        title={sidebarOpen ? "Hide list" : "Show list"}
      >
        {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 mr-auto">
        <div className="flex items-center justify-center w-6 h-6 rounded" style={{ background: "var(--amber)", flexShrink: 0 }}>
          <Layers size={12} color="#0e0f11" strokeWidth={2.5} />
        </div>
        <span
          className="font-bold"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", letterSpacing: "0.01em", color: "var(--text-primary)" }}
        >
          ASPHALT<span style={{ color: "var(--amber)" }}>MAP</span>
        </span>
        <span
          className="text-xs rounded px-1.5 py-0.5"
          style={{
            background: openCount > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
            color: openCount > 0 ? "#4ade80" : "#f87171",
            border: `1px solid ${openCount > 0 ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"}`,
            fontVariantNumeric: "tabular-nums",
            fontSize: "11px",
          }}
        >
          {openCount}/{totalCount} open
        </span>
      </div>

      {/* Find Closest */}
      <button
        onClick={onLocate}
        disabled={locating}
        className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "var(--amber)", color: "#0e0f11", fontFamily: "'Barlow', sans-serif" }}
        onMouseEnter={e => { if (!locating) (e.currentTarget as HTMLElement).style.background = "var(--amber-light)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--amber)"; }}
      >
        <MapPin size={12} className={locating ? "animate-bounce" : ""} />
        <span className="hidden sm:inline">{locating ? "Locating…" : "Find Closest"}</span>
        <span className="sm:hidden">{locating ? "…" : "Locate"}</span>
      </button>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors disabled:opacity-40"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--asphalt-hover)"; el.style.color = "var(--text-primary)"; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--text-secondary)"; }}
        title="Refresh"
      >
        <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
