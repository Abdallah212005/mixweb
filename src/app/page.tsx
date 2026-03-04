
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Terminal } from "lucide-react";

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
              <h1 className="mt-6 text-7xl font-bold tracking-tighter text-white uppercase glow-text">
                Engineer <br /> 
                <span className="text-accent">Influence</span>
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

      {/* 🚀 Slide 2: Cinematic Code Content */}
      <AnimatePresence>
        {isTransitioned && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1.5 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center gap-6">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="text-8xl font-black text-white glow-purple select-none"
              >
                &lt;/&gt;
              </motion.div>
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.8 }}
                className="text-4xl font-light tracking-[0.3em] text-accent uppercase"
              >
                Web Development
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 2.2, duration: 1 }}
                className="max-w-md text-center text-sm font-code text-white/80 leading-relaxed mt-4"
              >
                Precision engineering for the digital void. We craft high-performance architectures that define influence.
              </motion.p>
            </div>

            {/* Side Terminal Info */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 2.5, duration: 1 }}
              className="fixed bottom-12 right-12 p-6 border-l border-accent/30 bg-black/40 backdrop-blur-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <Terminal size={14} className="text-accent" />
                <span className="text-[10px] font-code text-accent uppercase tracking-widest">System Status</span>
              </div>
              <p className="text-[10px] font-code text-white/40">Core: 100% Operational</p>
              <p className="text-[10px] font-code text-white/40">Sync: Phase 02 Complete</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
