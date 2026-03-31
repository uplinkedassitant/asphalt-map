"use client";

import { Plant } from "@/types/plant";
import { getFullSchedule } from "@/lib/utils";
import { X, Phone, Navigation, Clock, Wrench, FileText, ChevronRight } from "lucide-react";

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
    <div className="flex flex-col h-full fade-up" style={{ background: "var(--asphalt-mid)" }}>
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 shrink-0"
        style={{ borderBottom: "1px solid var(--asphalt-border)" }}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {/* Open/Closed pill */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{
                  background: plant.isOpen ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
                  color: plant.isOpen ? "#4ade80" : "#f87171",
                  border: `1px solid ${plant.isOpen ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"}`,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: "0.06em",
                }}
              >
                <span
                  className={plant.isOpen ? "pulse-dot" : ""}
                  style={{
                    display: "inline-block",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: plant.isOpen ? "#4ade80" : "#f87171",
                  }}
                />
                {plant.statusText}
              </span>
            </div>

            <h2
              className="font-bold leading-snug"
              style={{
                color: "var(--text-primary)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "18px",
                letterSpacing: "0.01em",
              }}
            >
              {plant.name}
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {plant.address}
            </p>
            {plant.distance != null && (
              <p className="text-xs mt-0.5" style={{ color: "var(--amber)" }}>
                {plant.distance.toFixed(1)} miles away
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors mt-0.5"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--asphalt-hover)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          {plant.phone ? (
            <a
              href={`tel:${plant.phone}`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{
                background: "var(--asphalt-surface)",
                border: "1px solid var(--asphalt-border)",
                color: "var(--text-primary)",
                fontFamily: "'Barlow', sans-serif",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#3a3f4d"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--asphalt-border)"}
            >
              <Phone size={13} style={{ color: "var(--amber)" }} />
              Call
            </a>
          ) : (
            <div />
          )}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "var(--amber)",
              color: "#0e0f11",
              fontFamily: "'Barlow', sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--amber-light)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--amber)"}
          >
            <Navigation size={13} />
            Directions
          </a>
        </div>

        {/* Services */}
        <section>
          <SectionLabel icon={<Wrench size={11} />} label="Services" />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {plant.services.map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 rounded-lg text-xs"
                style={{
                  background: "var(--asphalt-surface)",
                  border: "1px solid var(--asphalt-border)",
                  color: "var(--text-secondary)",
                  fontFamily: "'Barlow', sans-serif",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Hours */}
        <section>
          <SectionLabel icon={<Clock size={11} />} label="Hours" />
          <div
            className="mt-2 rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--asphalt-border)" }}
          >
            {schedule.map(({ day, hours }) => {
              const isToday = day === today;
              return (
                <div
                  key={day}
                  className="flex justify-between items-center px-3 py-2 text-xs"
                  style={{
                    background: isToday ? "var(--asphalt-hover)" : "transparent",
                    borderBottom: "1px solid var(--asphalt-border)",
                  }}
                >
                  <span
                    style={{
                      color: isToday ? "var(--amber)" : "var(--text-secondary)",
                      fontWeight: isToday ? 600 : 400,
                      fontFamily: "'Barlow', sans-serif",
                    }}
                  >
                    {day}
                  </span>
                  <span
                    style={{
                      color: hours === "Closed" ? "var(--text-muted)" : (isToday ? "var(--text-primary)" : "var(--text-secondary)"),
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {hours}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Notes */}
        {plant.notes && (
          <section>
            <SectionLabel icon={<FileText size={11} />} label="Notes" />
            <p
              className="mt-2 text-xs leading-relaxed rounded-xl p-3 italic"
              style={{
                background: "var(--asphalt-surface)",
                border: "1px solid var(--asphalt-border)",
                color: "var(--text-secondary)",
              }}
            >
              {plant.notes}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color: "var(--text-muted)" }}>{icon}</span>
      <span
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}
      >
        {label}
      </span>
    </div>
  );
}
