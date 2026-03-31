"use server";

import { Plant } from "@/types/plant";
import { MOCK_PLANTS } from "./mockData";

export async function fetchPlants(): Promise<Plant[]> {
  // If Supabase env vars aren't set, use mock data
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "YOUR_SUPABASE_URL"
  ) {
    console.warn("Using mock data — set NEXT_PUBLIC_SUPABASE_URL to use Supabase");
    return MOCK_PLANTS;
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("asphalt_plants")
      .select("*")
      .order("name");

    if (error) {
      console.error("Supabase error:", error.message);
      return MOCK_PLANTS;
    }

    return (data as Plant[]) ?? [];
  } catch (err) {
    console.error("Failed to connect to Supabase:", err);
    return MOCK_PLANTS;
  }
}
