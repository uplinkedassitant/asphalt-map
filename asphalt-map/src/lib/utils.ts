import { Plant, DayOfWeek, WeeklyHours, DayHours } from "@/types/plant";

const DAYS: DayOfWeek[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(":").map(Number);
  return { hours: h, minutes: m };
}

function timeToMinutes(timeStr: string): number {
  const { hours, minutes } = parseTime(timeStr);
  return hours * 60 + minutes;
}

export function isPlantOpen(hours: WeeklyHours, now = new Date()): boolean {
  const day = DAYS[now.getDay()];
  const dayHours = hours[day];
  if (!dayHours || dayHours.closed) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = timeToMinutes(dayHours.open);
  const closeMinutes = timeToMinutes(dayHours.close);

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

export function getStatusText(hours: WeeklyHours, now = new Date()): string {
  const day = DAYS[now.getDay()];
  const dayHours = hours[day];

  if (!dayHours || dayHours.closed) {
    // Find next open day
    const nextOpen = findNextOpenDay(hours, now);
    return nextOpen ? `Closed — opens ${nextOpen}` : "Closed today";
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = timeToMinutes(dayHours.open);
  const closeMinutes = timeToMinutes(dayHours.close);

  if (currentMinutes < openMinutes) {
    return `Closed — opens at ${formatTime(dayHours.open)}`;
  }
  if (currentMinutes >= closeMinutes) {
    const nextOpen = findNextOpenDay(hours, now);
    return nextOpen ? `Closed — opens ${nextOpen}` : "Closed for the day";
  }
  return `Open until ${formatTime(dayHours.close)}`;
}

function findNextOpenDay(hours: WeeklyHours, now: Date): string | null {
  const todayIdx = now.getDay();
  for (let i = 1; i <= 7; i++) {
    const idx = (todayIdx + i) % 7;
    const day = DAYS[idx];
    const dayHours = hours[day];
    if (dayHours && !dayHours.closed) {
      const label = i === 1 ? "tomorrow" : capitalize(day);
      return `${label} at ${formatTime(dayHours.open)}`;
    }
  }
  return null;
}

function formatTime(timeStr: string): string {
  const { hours, minutes } = parseTime(timeStr);
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return minutes === 0
    ? `${displayHour} ${ampm}`
    : `${displayHour}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getTodayHours(hours: WeeklyHours, now = new Date()): string {
  const day = DAYS[now.getDay()];
  const dayHours = hours[day];
  if (!dayHours || dayHours.closed) return "Closed today";
  return `${formatTime(dayHours.open)} – ${formatTime(dayHours.close)}`;
}

export function getFullSchedule(hours: WeeklyHours): { day: string; hours: string }[] {
  return DAYS.map((day) => {
    const dh = hours[day];
    return {
      day: capitalize(day),
      hours:
        !dh || dh.closed
          ? "Closed"
          : `${formatTime(dh.open)} – ${formatTime(dh.close)}`,
    };
  });
}

export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function enrichPlants(plants: Plant[], userCoords?: { lat: number; lng: number }): Plant[] {
  const now = new Date();
  return plants.map((p) => {
    const distance =
      userCoords != null
        ? haversine(userCoords.lat, userCoords.lng, p.latitude, p.longitude)
        : undefined;
    return {
      ...p,
      isOpen: isPlantOpen(p.hours, now),
      statusText: getStatusText(p.hours, now),
      distance,
    };
  });
}
