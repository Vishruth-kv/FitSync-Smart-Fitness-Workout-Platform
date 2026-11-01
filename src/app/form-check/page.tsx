"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

const FormCheckClient = dynamic(() => import("@/components/FormCheckClient"), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-muted-foreground font-semibold">Loading pose detection engine...</div>
});

export default function FormCheckPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar userName="Athlete" />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">AI Form Checker</h1>
          <p className="text-muted-foreground text-lg font-medium">Check your exercise technique using pose detection.</p>
        </div>
        <FormCheckClient />
      </main>
    </div>
  );
}
