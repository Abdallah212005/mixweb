
"use client";

import React from "react";
import dynamic from "next/dynamic";

const SceneBackground = dynamic(
  () => import("@/components/three/SceneBackground").then((mod) => mod.SceneBackground),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="relative bg-black w-full h-screen overflow-hidden">
      {/* Real Earth Scene */}
      <SceneBackground />
      
      {/* Minimalist Overlay */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-20">
        <p className="font-code text-[10px] text-white uppercase tracking-[0.4em]">
          Orbital Dust Active • Interactive Core
        </p>
      </div>
    </main>
  );
}
