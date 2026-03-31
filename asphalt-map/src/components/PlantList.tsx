"use client";

import { Plant } from "@/types/plant";
import { getTodayHours } from "@/lib/utils";

interface PlantListProps {
  plants: Plant[];
  selectedId: string | null;
  onSelectPlant: (id: string) => void;
  loading?: boolean;
}

export default function PlantList({
  plants,
  selectedId,
  onSelectPlant,
  loading,
}: PlantListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-zinc-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="p-6 text-center text-zinc-500 text-sm">
        No plants found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3 overflow-y-auto">
      {plants.map((plant) => (
        <button
          key={plant.id}
          onClick={() => onSelectPlant(plant.id)}
          className={`w-full text-left rounded-xl p-3 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            selectedId === plant.id
              ? "bg-zinc-700 border-orange-500"
              : "bg-zinc-800 border-zinc-700 hover:bg-zinc-750 hover:border-zinc-500"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-zinc-100 truncate">
                {plant.name}
              </div>
              <div className="text-xs text-zinc-400 truncate mt-0.5">
                {plant.address}
              </div>
            </div>
            <StatusBadge isOpen={!!plant.isOpen} />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="text-xs text-zinc-400">
              🕐 {getTodayHours(plant.hours)}
            </div>
            {plant.distance != null && (
              <div className="text-xs text-zinc-500 ml-auto">
                {plant.distance.toFixed(1)} mi
              </div>
            )}
          </div>

          {plant.statusText && (
            <div
              className={`text-xs mt-1 font-medium ${
                plant.isOpen ? "text-green-400" : "text-red-400"
              }`}
            >
              {plant.statusText}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isOpen
          ? "bg-green-900/60 text-green-300 border border-green-700"
          : "bg-red-900/50 text-red-300 border border-red-800"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isOpen ? "bg-green-400" : "bg-red-400"
        }`}
      />
      {isOpen ? "Open" : "Closed"}
    </span>
  );
}
