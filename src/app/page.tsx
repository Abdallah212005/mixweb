"use client";

import React from "react";
import dynamic from "next/dynamic";

const SceneBackground = dynamic(
  () => import("@/components/three/SceneBackground").then((mod) => mod.SceneBackground),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="relative bg-black w-full h-screen overflow-hidden selection:bg-accent selection:text-black">
      {/* Background 3D Scene */}
      <SceneBackground />
      
      {/* Clean Slate HUD Overlay */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-[10px] font-code text-accent/50 uppercase tracking-[1.2em] animate-pulse">
            System Initialized
          </p>
          <div className="mt-4 w-32 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent mx-auto" />
        </div>
      </div>
      
      {/* Scroll indicator - placeholder for future content */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 pointer-events-none opacity-20">
        <p className="text-[8px] font-code text-white uppercase tracking-[0.5em]">Ready for expansion</p>
      </div>
    </main>
  );
}