"use client";

import React from "react";
import dynamic from "next/dynamic";

const SceneBackground = dynamic(
  () => import("@/components/three/SceneBackground").then((mod) => mod.SceneBackground),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="relative bg-[#050010] w-full h-screen overflow-hidden">
      {/* Magnetic Planet Scene */}
      <SceneBackground />
      
      {/* Overlay for interaction hint */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-30">
        <p className="font-code text-[10px] text-accent uppercase tracking-[0.4em]">
          Magnetic Field Active • Move Mouse to Interact
        </p>
      </div>
    </main>
  );
}
