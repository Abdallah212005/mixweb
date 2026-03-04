
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Cpu } from "lucide-react";

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
      
      {/* 🚀 HUD Layer 1: Entrance */}
      <AnimatePresence>
        {!isTransitioned && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-code text-[10px] text-accent/40 uppercase tracking-[1em] mb-4"
              >
                AuraForge Systems Online
              </motion.p>
              <motion.h1 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-7xl font-black tracking-tighter text-white uppercase glow-text"
              >
                Engineer <br /> 
                <span className="text-accent">Influence</span>
              </motion.h1>
            </div>

            <motion.button
              onClick={handleNext}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto p-4 text-white/30 hover:text-accent hover:scale-110 transition-all"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ChevronDown size={32} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 HUD Layer 2: Web Dev Reveal */}
      <AnimatePresence>
        {isTransitioned && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center gap-2 mt-[45vh]">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="text-[48px] font-black tracking-[0.3em] text-gradient uppercase glow-purple text-center"
              >
                WEB DEVELOPMENT
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1.8, duration: 1 }}
                className="max-w-md text-center text-[11px] font-code text-white uppercase tracking-[0.8em] mt-4"
              >
                Architecture built for digital dominance
              </motion.p>
            </div>

            {/* Side Analytics HUD */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 2.2, duration: 1 }}
              className="fixed bottom-12 right-12 p-8 border-r-2 border-accent/20 bg-black/40 backdrop-blur-xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <Cpu size={16} className="text-accent animate-pulse" />
                <span className="text-[10px] font-code text-accent uppercase tracking-[0.3em]">Core Status</span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-code text-white/40">LATENCY: 0.04ms</p>
                <p className="text-[10px] font-code text-white/40">BANDWIDTH: MAX</p>
                <p className="text-[10px] font-code text-white/40">INTEGRITY: 100%</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
