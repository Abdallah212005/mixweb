
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Cpu, Code } from "lucide-react";

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
            className="fixed inset-0 z-10 flex flex-col items-start justify-center pl-[55%] pointer-events-none"
          >
            <div className="flex flex-col items-start gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-6xl font-black text-white/90 tracking-[0.2em] glow-text mb-4"
              >
                &lt;/&gt;
              </motion.div>
              
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 1 }}
                className="text-[48px] font-black tracking-[0.2em] text-gradient uppercase glow-purple"
              >
                WEB DEVELOPMENT
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 2, duration: 1 }}
                className="max-w-md text-left text-[11px] font-code text-white uppercase tracking-[0.6em] mt-2"
              >
                Architecting digital empires with precision code and futuristic aesthetics.
              </motion.p>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 2.2, duration: 0.8 }}
                className="h-1 w-32 bg-accent mt-4 origin-left shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              />
            </div>

            {/* Side Analytics HUD */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 2.5, duration: 1 }}
              className="fixed bottom-12 right-12 p-8 border-r-2 border-accent/20 bg-black/40 backdrop-blur-xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <Code size={16} className="text-accent animate-pulse" />
                <span className="text-[10px] font-code text-accent uppercase tracking-[0.3em]">Codebase Alpha</span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-code text-white/40">STACK: NEXT.JS 15 / THREE.JS</p>
                <p className="text-[10px] font-code text-white/40">DENSITY: 3000 STARS</p>
                <p className="text-[10px] font-code text-white/40">RENDER: CINEMATIC SHADER</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
