
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const SceneBackground = dynamic(
  () => import("@/components/three/SceneBackground").then((mod) => mod.SceneBackground),
  { ssr: false }
);

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="bg-black w-screen h-screen" />;

  return (
    <main className="relative bg-[#050406] w-full h-screen overflow-hidden selection:bg-accent selection:text-black">
      {/* 3D Planet Scene */}
      <SceneBackground />
      
      {/* High-End HUD Overlay */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-center"
        >
          <p className="text-[10px] font-code text-accent/60 uppercase tracking-[1.5em] animate-pulse mb-4">
            AuraForge Terminal
          </p>
          
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter glow-text mb-2">
              System Initialized
            </h1>
            <div className="hud-line w-full h-[1px] mx-auto mb-6" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-[9px] font-code text-white/30 uppercase tracking-[0.8em]">
              Ready for strategic expansion
            </p>
            <div className="w-1 h-1 bg-accent rounded-full animate-ping mt-4" />
          </div>
        </motion.div>
      </div>

      {/* Side HUD Elements */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 flex flex-col gap-12 opacity-20 hidden md:flex pointer-events-none">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-white" />
            <span className="text-[8px] font-code tracking-widest">00{i}</span>
          </div>
        ))}
      </div>

      <div className="fixed right-8 bottom-8 pointer-events-none opacity-40">
        <p className="text-[8px] font-code text-white uppercase tracking-[0.4em]">
          Coordinates: 41.40338, 2.17403
        </p>
      </div>
    </main>
  );
}
