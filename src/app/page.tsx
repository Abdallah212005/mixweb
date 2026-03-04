
"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Code, TrendingUp, Cpu } from "lucide-react";

const SceneBackground = dynamic(
  () => import("@/components/three/SceneBackground").then((mod) => mod.SceneBackground),
  { ssr: false }
);

export default function Page() {
  const [scene, setScene] = useState(1);
  const totalScenes = 3;
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    if (scene < totalScenes) {
      setIsTransitioning(true);
      setScene(s => s + 1);
      setTimeout(() => setIsTransitioning(false), 1500);
    }
  }, [scene, isTransitioning]);

  const handlePrev = useCallback(() => {
    if (isTransitioning) return;
    if (scene > 1) {
      setIsTransitioning(true);
      setScene(s => s - 1);
      setTimeout(() => setIsTransitioning(false), 1500);
    }
  }, [scene, isTransitioning]);

  useEffect(() => {
    let lastWheelTime = 0;
    
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime < 1000) return;

      if (e.deltaY > 30) {
        handleNext();
        lastWheelTime = now;
      } else if (e.deltaY < -30) {
        handlePrev();
        lastWheelTime = now;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        handleNext();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        handlePrev();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext, handlePrev]);

  return (
    <main className="relative bg-black w-full h-screen overflow-hidden">
      <SceneBackground scene={scene} />
      
      {/* 🚀 HUD Layer 1: Entrance */}
      <AnimatePresence mode="wait">
        {scene === 1 && (
          <motion.div 
            key="scene-1"
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
                className="text-7xl font-black tracking-tighter text-white uppercase glow-text leading-[0.9]"
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
      <AnimatePresence mode="wait">
        {scene === 2 && (
          <motion.div 
            key="scene-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-10 flex flex-col items-start justify-center pl-[55%] pointer-events-none"
          >
            <div className="flex flex-col items-start gap-2">
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-6xl font-black tracking-[12px] text-gradient uppercase glow-purple mb-2 leading-none"
              >
                WEB DEVELOPMENT
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="max-w-md text-left text-[11px] font-code text-white uppercase tracking-[0.5em] leading-relaxed"
              >
                Architecting digital empires with precision code and futuristic aesthetics.
              </motion.p>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="h-1 w-40 bg-accent mt-6 origin-left shadow-[0_0_20px_rgba(168,85,247,0.7)]"
              />
            </div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="fixed bottom-12 right-12 p-10 border-r-2 border-accent/20 bg-black/40 backdrop-blur-3xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <Code size={18} className="text-accent animate-pulse" />
                <span className="text-[11px] font-code text-accent uppercase tracking-[0.4em]">Engine: AuraCore 3.0</span>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-code text-white/40">PARTICLES: 6000 ACTIVE</p>
                <p className="text-[10px] font-code text-white/40">MORPH: SYMBOL.CSS</p>
                <p className="text-[10px] font-code text-white/40">SYNC: CLOUD_READY</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 HUD Layer 3: Digital Marketing Reveal */}
      <AnimatePresence mode="wait">
        {scene === 3 && (
          <motion.div 
            key="scene-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-10 flex flex-col items-start justify-center pl-[12%] pointer-events-none"
          >
            <div className="flex flex-col items-start gap-2">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-6xl font-black tracking-[12px] text-gradient uppercase glow-purple mb-2 leading-none"
              >
                DIGITAL MARKETING
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="max-w-md text-left text-[11px] font-code text-white uppercase tracking-[0.5em] leading-relaxed"
              >
                Engineering virality and market dominance through data-driven campaigns.
              </motion.p>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="h-1 w-40 bg-accent mt-6 origin-left shadow-[0_0_20px_rgba(168,85,247,0.7)]"
              />
            </div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="fixed bottom-12 left-12 p-10 border-l-2 border-accent/20 bg-black/40 backdrop-blur-3xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <TrendingUp size={18} className="text-accent animate-pulse" />
                <span className="text-[11px] font-code text-accent uppercase tracking-[0.4em]">Engine: GrowthMatrix</span>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-code text-white/40">KPI: +320% ENGAGEMENT</p>
                <p className="text-[10px] font-code text-white/40">SENTIMENT: POSITIVE</p>
                <p className="text-[10px] font-code text-white/40">REGION: GLOBAL_NODE</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
