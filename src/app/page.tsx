
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const SceneBackground = dynamic(
  () => import("@/components/three/SceneBackground").then((mod) => mod.SceneBackground),
  { ssr: false }
);

export default function Page() {
  const [isTransitioned, setIsTransitioned] = useState(false);

  const handleNext = () => {
    if (!isTransitioned) {
      setIsTransitioned(true);
    }
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 50 && !isTransitioned) {
        handleNext();
      }
    };

    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isTransitioned]);

  return (
    <main className="relative bg-black w-full h-screen overflow-hidden">
      <SceneBackground isTransitioned={isTransitioned} />
      
      {/* 🚀 Slide 1: HUD */}
      <AnimatePresence>
        {!isTransitioned && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <p className="font-code text-[10px] text-accent/20 uppercase tracking-[0.8em] animate-pulse">
                AuraForge Command Console
              </p>
              <h1 className="mt-6 text-6xl font-bold tracking-tighter text-white uppercase glow-text">
                Explore the Void
              </h1>
            </div>

            <motion.button
              onClick={handleNext}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto p-4 text-white/50 hover:text-white transition-colors"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ChevronDown size={40} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 Slide 2: Second Content */}
      <AnimatePresence>
        {isTransitioned && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="fixed inset-y-0 right-0 w-1/2 z-10 flex flex-col items-start justify-center p-20 bg-gradient-to-l from-black/80 to-transparent backdrop-blur-sm"
          >
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 mb-6 text-[10px] font-code text-accent border border-accent/30 rounded-full">
                Phase 02: Integration
              </span>
              <h2 className="text-5xl font-black text-white uppercase leading-tight mb-6">
                Redefining the <br /> 
                <span className="text-accent glow-text">Digital Atmosphere</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                We craft high-performance digital ecosystems that transcend traditional boundaries. 
                Our approach combines artistic precision with technological power.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl border border-white/5 bg-white/5">
                  <h4 className="font-code text-accent mb-2">01. Dynamic</h4>
                  <p className="text-xs text-white/40">Real-time adaptive interfaces.</p>
                </div>
                <div className="p-6 rounded-2xl border border-white/5 bg-white/5">
                  <h4 className="font-code text-accent mb-2">02. Secure</h4>
                  <p className="text-xs text-white/40">Encryption at every terminal.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
