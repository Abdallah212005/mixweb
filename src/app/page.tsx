
"use client";

import React from "react";
import dynamic from "next/dynamic";

const SceneBackground = dynamic(
  () => import("@/components/three/SceneBackground").then((mod) => mod.SceneBackground),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="relative bg-[#050406] w-full h-screen overflow-hidden selection:bg-accent selection:text-black">
      {/* 3D Planet Scene Only */}
      <SceneBackground />
      
      {/* Absolute Zero UI Overlay */}
      <div className="fixed inset-0 pointer-events-none z-10" />
    </main>
  );
}
