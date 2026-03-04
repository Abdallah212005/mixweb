
"use client";

import React from "react";
import dynamic from "next/dynamic";

const SceneBackground = dynamic(
  () => import("@/components/three/SceneBackground").then((mod) => mod.SceneBackground),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="relative bg-[#000000] w-full h-screen overflow-hidden">
      {/* 3D Planet Scene Only */}
      <SceneBackground />
      
      {/* Clean Slate Layer */}
      <div className="fixed inset-0 z-10 pointer-events-none flex items-center justify-center">
        <div className="opacity-0">Planet Initialized</div>
      </div>
    </main>
  );
}
