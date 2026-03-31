"use client";

import { Plant } from "@/types/plant";
import { getFullSchedule } from "@/lib/utils";
import { X, Phone, Navigation, Clock, Wrench, FileText } from "lucide-react";

interface PlantDetailProps {
  plant: Plant;
  onClose: () => void;
}

const DAYS_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function PlantDetail({ plant, onClose }: PlantDetailProps) {
  const schedule = getFullSchedule(plant.hours);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(plant.address)}`;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 border-b border-zinc-700">
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base leading-tight text-white">
            {plant.name}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">{plant.address}</p>
          {plant.distance != null && (
            <p className="text-xs text-zinc-500 mt-0.5">
              {plant.distance.toFixed(1)} miles away
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1.5 rounded-lg hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Status */}
      <div
        className={`mx-4 mt-3 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
          plant.isOpen
            ? "bg-green-900/50 text-green-300 border border-green-700"
            : "bg-red-900/40 text-red-300 border border-red-800"
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${plant.isOpen ? "bg-green-400" : "bg-red-400"}`} />
        {plant.statusText}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          {plant.phone && (
            <a
              href={`tel:${plant.phone}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-sm font-medium transition-colors"
            >
              <Phone size={14} className="text-orange-400" />
              Call
            </a>
          )}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-sm font-semibold transition-colors text-white"
          >
            <Navigation size={14} />
            Directions
          </a>
        </div>

        {/* Services */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={13} className="text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Services
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {plant.services.map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-600 text-xs text-zinc-200"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Hours */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={13} className="text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Hours
            </span>
          </div>
          <div className="space-y-1 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700">
            {schedule.map(({ day, hours }) => (
              <div
                key={day}
                className={`flex justify-between items-center px-3 py-2 text-xs ${
                  day === today
                    ? "bg-zinc-700 text-white font-semibold"
                    : "text-zinc-300"
                }`}
              >
                <span className={day === today ? "text-orange-400" : ""}>{day}</span>
                <span
                  className={
                    hours === "Closed" ? "text-red-400" : "text-zinc-100"
                  }
                >
                  {hours}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Notes */}
        {plant.notes && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={13} className="text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Notes
              </span>
            </div>
            <p className="text-xs text-zinc-400 italic leading-relaxed bg-zinc-800 rounded-xl p-3 border border-zinc-700">
              {plant.notes}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
