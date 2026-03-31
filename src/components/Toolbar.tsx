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
      className="flex items-center gap-2 px-3 shrink-0 z-10"
      style={{
        background: "var(--asphalt-mid)",
        borderBottom: "1px solid var(--asphalt-border)",
        height: "48px",
        minHeight: "48px",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mr-auto min-w-0">
        <div
          className="flex items-center justify-center rounded shrink-0"
          style={{ background: "var(--amber)", width: "24px", height: "24px" }}
        >
          <Layers size={12} color="#0e0f11" strokeWidth={2.5} />
        </div>
        <span
          className="font-bold shrink-0"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "16px",
            letterSpacing: "0.01em",
            color: "var(--text-primary)",
          }}
        >
          ASPHALT<span style={{ color: "var(--amber)" }}>MAP</span>
        </span>
        <span
          className="shrink-0 text-xs rounded px-1.5 py-0.5"
          style={{
            background: openCount > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
            color: openCount > 0 ? "#4ade80" : "#f87171",
            border: `1px solid ${openCount > 0 ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"}`,
            fontSize: "11px",
            whiteSpace: "nowrap",
          }}
        >
          {openCount}/{totalCount} open
        </span>
      </div>

      {/* Find Closest */}
      <button
        onClick={onLocate}
        disabled={locating}
        className="flex items-center gap-1.5 px-3 h-8 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        style={{
          background: "var(--amber)",
          color: "#0e0f11",
          fontFamily: "'Barlow', sans-serif",
          fontSize: "12px",
          whiteSpace: "nowrap",
        }}
      >
        <MapPin size={12} className={locating ? "animate-bounce" : ""} />
        {locating ? "Locating…" : "Find Closest"}
      </button>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 shrink-0"
        style={{
          color: "var(--text-secondary)",
          width: "32px",
          height: "32px",
        }}
      >
        <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
