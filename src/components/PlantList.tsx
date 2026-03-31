"use client";

import { Plant } from "@/types/plant";
import { getTodayHours } from "@/lib/utils";
import { MapPin, Clock } from "lucide-react";

interface PlantListProps {
  plants: Plant[];
  selectedId: string | null;
  onSelectPlant: (id: string) => void;
  loading?: boolean;
}

export default function PlantList({ plants, selectedId, onSelectPlant, loading }: PlantListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl animate-pulse"
            style={{
              height: "76px",
              background: "var(--asphalt-surface)",
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-2">
        <MapPin size={24} style={{ color: "var(--text-muted)" }} />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No plants found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 p-2.5">
      {plants.map((plant, i) => {
        const isSelected = selectedId === plant.id;
        return (
          <button
            key={plant.id}
            onClick={() => onSelectPlant(plant.id)}
            className="w-full text-left rounded-xl p-3 transition-all duration-150 focus:outline-none slide-in"
            style={{
              background: isSelected ? "var(--asphalt-hover)" : "var(--asphalt-surface)",
              border: `1px solid ${isSelected ? "var(--amber)" : "var(--asphalt-border)"}`,
              boxShadow: isSelected ? "0 0 0 1px var(--amber-dim)" : "none",
              animationDelay: `${i * 30}ms`,
            }}
            onMouseEnter={e => {
              if (!isSelected) {
                (e.currentTarget as HTMLElement).style.borderColor = "#3a3f4d";
                (e.currentTarget as HTMLElement).style.background = "var(--asphalt-hover)";
              }
            }}
            onMouseLeave={e => {
              if (!isSelected) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--asphalt-border)";
                (e.currentTarget as HTMLElement).style.background = "var(--asphalt-surface)";
              }
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <div
                  className="font-semibold text-sm truncate leading-tight"
                  style={{
                    color: isSelected ? "var(--amber-light)" : "var(--text-primary)",
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  {plant.name}
                </div>
                <div
                  className="text-xs truncate mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {plant.address}
                </div>
              </div>
              <StatusBadge isOpen={!!plant.isOpen} />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock size={10} style={{ color: "var(--text-muted)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {getTodayHours(plant.hours)}
                </span>
              </div>
              {plant.distance != null && (
                <div
                  className="ml-auto text-xs flex items-center gap-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  <MapPin size={9} />
                  {plant.distance.toFixed(1)} mi
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function StatusBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: isOpen ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
        color: isOpen ? "#4ade80" : "#f87171",
        border: `1px solid ${isOpen ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: "0.05em",
        fontSize: "11px",
      }}
    >
      <span
        className={isOpen ? "pulse-dot" : ""}
        style={{
          display: "inline-block",
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: isOpen ? "#4ade80" : "#f87171",
        }}
      />
      {isOpen ? "OPEN" : "CLOSED"}
    </span>
  );
}
