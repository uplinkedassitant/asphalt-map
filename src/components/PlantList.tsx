"use client";

import { Plant } from "@/types/plant";
import { getTodayHours } from "@/lib/utils";
import { MapPin, Clock, ChevronDown } from "lucide-react";
import { useState } from "react";

interface PlantListProps {
  plants: Plant[];
  selectedId: string | null;
  onSelectPlant: (id: string) => void;
  loading?: boolean;
  /** How many to show before "Show more". Default 4 */
  initialVisible?: number;
}

export default function PlantList({
  plants,
  selectedId,
  onSelectPlant,
  loading,
  initialVisible = 4,
}: PlantListProps) {
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl animate-pulse"
            style={{ height: "72px", background: "var(--asphalt-surface)", animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-2">
        <MapPin size={22} style={{ color: "var(--text-muted)" }} />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No plants found</p>
      </div>
    );
  }

  const visiblePlants = showAll ? plants : plants.slice(0, initialVisible);
  const hiddenCount = plants.length - initialVisible;

  return (
    <div className="flex flex-col gap-1.5 p-2.5">
      {visiblePlants.map((plant, i) => {
        const isSelected = selectedId === plant.id;
        return (
          <PlantCard
            key={plant.id}
            plant={plant}
            isSelected={isSelected}
            index={i}
            onSelect={() => onSelectPlant(plant.id)}
          />
        );
      })}

      {/* Show more / Show less toggle */}
      {plants.length > initialVisible && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-semibold transition-colors mt-0.5"
          style={{
            background: "var(--asphalt-surface)",
            border: "1px solid var(--asphalt-border)",
            color: "var(--text-secondary)",
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: "0.06em",
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#3a3f4d"; el.style.color = "var(--text-primary)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--asphalt-border)"; el.style.color = "var(--text-secondary)"; }}
        >
          <ChevronDown
            size={13}
            style={{ transition: "transform 0.2s", transform: showAll ? "rotate(180deg)" : "rotate(0deg)" }}
          />
          {showAll ? "SHOW LESS" : `SHOW ${hiddenCount} MORE`}
        </button>
      )}
    </div>
  );
}

function PlantCard({
  plant,
  isSelected,
  index,
  onSelect,
}: {
  plant: Plant;
  isSelected: boolean;
  index: number;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-xl p-3 transition-all duration-150 focus:outline-none slide-in"
      style={{
        background: isSelected ? "var(--asphalt-hover)" : "var(--asphalt-surface)",
        border: `1px solid ${isSelected ? "var(--amber)" : "var(--asphalt-border)"}`,
        animationDelay: `${index * 30}ms`,
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "#3a3f4d";
          el.style.background = "var(--asphalt-hover)";
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--asphalt-border)";
          el.style.background = "var(--asphalt-surface)";
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
          <div className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
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
          <div className="ml-auto text-xs flex items-center gap-0.5" style={{ color: "var(--text-muted)" }}>
            <MapPin size={9} />
            {plant.distance.toFixed(1)} mi
          </div>
        )}
      </div>
    </button>
  );
}

function StatusBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
      style={{
        background: isOpen ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
        color: isOpen ? "#4ade80" : "#f87171",
        border: `1px solid ${isOpen ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: "0.05em",
        fontSize: "11px",
        fontWeight: 700,
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
