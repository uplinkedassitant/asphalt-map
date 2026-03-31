export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DayHours {
  open: string; // "06:00"
  close: string; // "17:00"
  closed?: boolean;
}

export type WeeklyHours = Partial<Record<DayOfWeek, DayHours>>;

export interface Plant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  services: string[];
  hours: WeeklyHours;
  phone?: string;
  notes?: string;
  created_at?: string;
  // Computed client-side
  distance?: number;
  isOpen?: boolean;
  statusText?: string;
}
