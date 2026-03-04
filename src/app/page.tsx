
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
      <SceneBackground />
      
      {/* 🚀 Minimalist HUD */}
      <div className="fixed inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="font-code text-[10px] text-accent/20 uppercase tracking-[0.8em] animate-pulse">
            AuraForge Command Console
          </p>
        </div>
      </div>
    </main>
  );
}
