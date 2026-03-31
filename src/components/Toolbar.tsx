"use client";

import { MapPin, RefreshCw, Layers } from "lucide-react";

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
      className="shrink-0 z-10 flex flex-col"
      style={{
        background: "var(--asphalt-mid)",
        borderBottom: "2px solid var(--asphalt-border)",
      }}
    >
      {/* Row 1: Logo + badge */}
      <div className="flex items-center gap-2 px-3" style={{ height: "44px" }}>
        <div
          className="flex items-center justify-center rounded shrink-0"
          style={{ background: "var(--amber)", width: "26px", height: "26px" }}
        >
          <Layers size={13} color="#0e0f11" strokeWidth={2.5} />
        </div>
        <span
          className="font-bold"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "18px",
            letterSpacing: "0.01em",
            color: "var(--text-primary)",
          }}
        >
          ASPHALT<span style={{ color: "var(--amber)" }}>MAP</span>
        </span>
        <span
          className="text-xs rounded px-2 py-0.5 ml-1"
          style={{
            background: openCount > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
            color: openCount > 0 ? "#4ade80" : "#f87171",
            border: `1px solid ${openCount > 0 ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"}`,
            fontSize: "11px",
            whiteSpace: "nowrap",
            fontWeight: 600,
          }}
        >
          {openCount}/{totalCount} open
        </span>
      </div>

      {/* Row 2: Action buttons */}
      <div
        className="flex items-center gap-2 px-3 pb-2.5"
        style={{ borderTop: "1px solid var(--asphalt-border)" }}
      >
        <button
          onClick={onLocate}
          disabled={locating}
          className="flex items-center justify-center gap-2 flex-1 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "var(--amber)",
            color: "#0e0f11",
            fontFamily: "'Barlow', sans-serif",
            fontSize: "13px",
            height: "38px",
            whiteSpace: "nowrap",
          }}
        >
          <MapPin size={13} className={locating ? "animate-bounce" : ""} />
          {locating ? "Locating…" : "Find Closest Open Plant"}
        </button>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 shrink-0"
          style={{
            color: "var(--text-secondary)",
            background: "var(--asphalt-surface)",
            border: "1px solid var(--asphalt-border)",
            width: "38px",
            height: "38px",
          }}
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}
