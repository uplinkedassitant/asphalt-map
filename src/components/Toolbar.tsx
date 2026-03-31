"use client";

import { MapPin, RefreshCw, Layers, Sun, Moon } from "lucide-react";

interface ToolbarProps {
  onLocate: () => void;
  onRefresh: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  locating: boolean;
  refreshing: boolean;
  openCount: number;
  totalCount: number;
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function Toolbar({
  onLocate, onRefresh, locating, refreshing,
  openCount, totalCount, darkMode, onToggleDark,
}: ToolbarProps) {
  return (
    <div
      style={{
        background: "var(--surface-mid)",
        borderBottom: "2px solid var(--border)",
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Row 1: Logo + badge + dark toggle — all in one flex row, no wrapping */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          height: "48px",
          gap: "8px",
        }}
      >
        {/* Icon */}
        <div style={{
          width: "28px", height: "28px", borderRadius: "6px",
          background: "var(--amber)", display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0,
        }}>
          <Layers size={14} color="#fff" strokeWidth={2.5} />
        </div>

        {/* Title */}
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "18px", fontWeight: 700, letterSpacing: "0.01em",
          color: "var(--text-primary)", whiteSpace: "nowrap", flexShrink: 0,
        }}>
          ASPHALT<span style={{ color: "var(--amber)" }}>MAP</span>
        </span>

        {/* Badge */}
        <span style={{
          background: openCount > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
          color: openCount > 0 ? "#16a34a" : "#dc2626",
          border: `1px solid ${openCount > 0 ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`,
          fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap",
          padding: "2px 8px", borderRadius: "999px", flexShrink: 0,
        }}>
          {openCount}/{totalCount} open
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Dark mode toggle — pushed to far right */}
        <button
          onClick={onToggleDark}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            width: "34px", height: "34px", borderRadius: "8px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--hover)", border: "1px solid var(--border)",
            color: "var(--text-secondary)", cursor: "pointer",
          }}
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Row 2: Action buttons */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "0 12px 10px 12px",
        borderTop: "1px solid var(--border)",
      }}>
        <button
          onClick={onLocate}
          disabled={locating}
          style={{
            flex: 1, height: "40px", borderRadius: "10px",
            background: "var(--amber)", color: "#fff", border: "none",
            fontFamily: "'Barlow', sans-serif", fontSize: "14px", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            cursor: locating ? "not-allowed" : "pointer",
            opacity: locating ? 0.6 : 1, whiteSpace: "nowrap",
          }}
        >
          <MapPin size={14} style={{ animation: locating ? "bounce 1s infinite" : "none" }} />
          {locating ? "Locating…" : "Find Closest Open Plant"}
        </button>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          style={{
            width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--surface)", border: "1px solid var(--border)",
            color: "var(--text-secondary)", cursor: refreshing ? "not-allowed" : "pointer",
            opacity: refreshing ? 0.4 : 1,
          }}
        >
          <RefreshCw size={15} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
        </button>
      </div>
    </div>
  );
}
