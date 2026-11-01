import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitMatch AI — Find Your Perfect Gym Partner",
  description: "AI-powered gym partner matching based on your goals, schedule, location, and fitness level.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
