import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "AsphaltMap — Find Open Plants",
  description: "Real-time map of asphalt plant locations, hours, and services for road crews.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-zinc-900 antialiased">{children}</body>
    </html>
  );
}
