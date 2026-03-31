"use client";

import { MapPin, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border-b border-zinc-700 z-10 shrink-0">
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
        title={sidebarOpen ? "Hide list" : "Show list"}
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* App title */}
      <div className="flex items-center gap-2 mr-auto">
        <span className="text-orange-500 font-bold text-sm tracking-tight">
          🛣 AsphaltMap
        </span>
        <span className="text-xs text-zinc-500 hidden sm:block">
          {openCount} of {totalCount} open now
        </span>
      </div>

      {/* Find closest open */}
      <button
        onClick={onLocate}
        disabled={locating}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
      >
        <MapPin size={13} className={locating ? "animate-bounce" : ""} />
        <span className="hidden sm:inline">
          {locating ? "Locating…" : "Find Closest Open"}
        </span>
        <span className="sm:hidden">{locating ? "…" : "Locate"}</span>
      </button>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="p-2 rounded-lg hover:bg-zinc-700 disabled:opacity-50 text-zinc-400 hover:text-white transition-colors"
        title="Refresh plant data"
      >
        <RefreshCw
          size={14}
          className={refreshing ? "animate-spin" : ""}
        />
      </button>
    </div>
  );
}
