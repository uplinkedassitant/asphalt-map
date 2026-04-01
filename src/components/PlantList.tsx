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
  initialVisible?: number;
}

export default function PlantList({
  plants, selectedId, onSelectPlant, loading, initialVisible = 4,
}: PlantListProps) {
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "10px" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse" style={{
            height: "72px", borderRadius: "12px",
            background: "var(--surface)", animationDelay: `${i * 80}ms`,
          }} />
        ))}
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px", gap: "8px" }}>
        <MapPin size={22} style={{ color: "var(--text-muted)" }} />
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No plants found</p>
      </div>
    );
  }

  const visiblePlants = showAll ? plants : plants.slice(0, initialVisible);
  const hiddenCount = plants.length - initialVisible;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "10px" }}>
      {visiblePlants.map((plant, i) => (
        <PlantCard
          key={plant.id}
          plant={plant}
          isSelected={selectedId === plant.id}
          index={i}
          onSelect={() => onSelectPlant(plant.id)}
        />
      ))}

      {plants.length > initialVisible && (
        <button
          onClick={() => setShowAll(v => !v)}
          style={{
            width: "100%", height: "40px", borderRadius: "12px",
            background: "var(--surface)", border: "1px solid var(--border)",
            color: "var(--text-secondary)", cursor: "pointer",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}
        >
          <ChevronDown size={13} style={{ transition: "transform 0.2s", transform: showAll ? "rotate(180deg)" : "rotate(0deg)" }} />
          {showAll ? "SHOW LESS" : `SHOW ${hiddenCount} MORE`}
        </button>
      )}
    </div>
  );
}

function PlantCard({ plant, isSelected, index, onSelect }: {
  plant: Plant; isSelected: boolean; index: number; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        // Fixed height so all cards are identical size
        height: "80px",
        width: "100%",
        borderRadius: "12px",
        padding: "10px 12px",
        background: isSelected ? "var(--hover)" : "var(--surface)",
        border: `1.5px solid ${isSelected ? "var(--amber)" : "var(--border)"}`,
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      {/* Top row: name block left, badge pinned right */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Barlow', sans-serif", fontSize: "13px", fontWeight: 700,
            color: isSelected ? "var(--amber)" : "var(--text-primary)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            lineHeight: "1.2",
          }}>
            {plant.name}
          </div>
          <div style={{
            fontSize: "11px", color: "var(--text-muted)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            marginTop: "2px",
          }}>
            {plant.address}
          </div>
        </div>
        {/* Badge — always right-aligned, never wraps */}
        <div style={{ flexShrink: 0, marginLeft: "auto" }}>
          <StatusBadge isOpen={!!plant.isOpen} />
        </div>
      </div>

      {/* Bottom row: hours + distance */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Clock size={10} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            {getTodayHours(plant.hours)}
          </span>
        </div>
        {plant.distance != null && (
          <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", color: "var(--text-muted)" }}>
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
    <span style={{
      flexShrink: 0,
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "2px 8px", borderRadius: "999px",
      background: isOpen ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)",
      color: isOpen ? "#16a34a" : "#dc2626",
      border: `1px solid ${isOpen ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)"}`,
      fontSize: "11px", fontWeight: 700,
      fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em",
    }}>
      <span className={isOpen ? "pulse-dot" : ""} style={{
        display: "inline-block", width: "5px", height: "5px", borderRadius: "50%",
        background: isOpen ? "#16a34a" : "#dc2626",
      }} />
      {isOpen ? "OPEN" : "CLOSED"}
    </span>
  );
}
