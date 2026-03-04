"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Instagram, Facebook, MessageSquare, Send, Zap, ShieldCheck, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const SceneBackground = dynamic(
  () => import("@/components/three/SceneBackground").then((mod) => mod.SceneBackground),
  { ssr: false }
);

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [scene, setScene] = useState(1);
  const totalScenes = 4;
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Refs for touch navigation
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!mounted) return;

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

    // Touch handlers for mobile swipe
    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartRef.current === null) return;
      
      const touchEnd = e.changedTouches[0].clientY;
      const diff = touchStartRef.current - touchEnd;
      const threshold = 50; // Minimum distance for swipe

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
      
      touchStartRef.current = null;
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleNext, handlePrev, mounted]);

  if (!mounted) return null;

  return (
    <main className="relative bg-black w-full h-screen overflow-hidden font-body">
      <SceneBackground scene={scene} />
      
      {/* 🚀 HUD Layer 1: Professional Intro */}
      <AnimatePresence mode="wait">
        {scene === 1 && (
          <motion.div 
            key="scene-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none p-4 md:p-10"
          >
            {/* Top Left: System Status */}
            <div className="absolute top-6 left-6 md:top-10 md:left-10 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[8px] md:text-[10px] font-code text-accent uppercase tracking-[0.3em]">System: Active</span>
              </div>
              <span className="text-[6px] md:text-[8px] font-code text-white/30 uppercase tracking-[0.2em]">Auth: Secure_Admin</span>
            </div>

            {/* Top Right: Coordinates */}
            <div className="absolute top-6 right-6 md:top-10 md:right-10 flex flex-col items-end gap-1 text-[6px] md:text-[8px] font-code text-white/30 uppercase tracking-[0.2em]">
              <span>LAT: 30.0444° N</span>
              <span>LON: 31.2357° E</span>
              <span className="text-accent/40 mt-1 hidden md:block">Status: Orbital_Sync</span>
            </div>

            {/* Main Center Content */}
            <div className="relative text-center w-full px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative"
              >
                <div className="absolute -inset-10 bg-accent/5 blur-[80px] rounded-full" />
                <h1 className="text-6xl sm:text-8xl md:text-[12rem] font-black tracking-tighter text-white uppercase leading-[0.8] drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  Mix <br /> 
                  <span className="text-accent glow-text">Aura</span>
                </h1>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 md:mt-8 flex flex-col items-center gap-4"
              >
                <div className="h-px w-12 md:w-20 bg-accent/40" />
                <p className="text-[10px] md:text-[14px] font-code text-white/60 uppercase tracking-[0.4em] md:tracking-[0.8em] text-center max-w-xs md:max-w-none">
                  Architects of Digital Dominance
                </p>
                <div className="flex gap-4 md:gap-8 mt-4">
                   <div className="flex items-center gap-2 opacity-40">
                      <Zap size={10} className="text-accent md:w-3 md:h-3" />
                      <span className="text-[7px] md:text-[8px] font-code">Fast</span>
                   </div>
                   <div className="flex items-center gap-2 opacity-40">
                      <ShieldCheck size={10} className="text-accent md:w-3 md:h-3" />
                      <span className="text-[7px] md:text-[8px] font-code">Secure</span>
                   </div>
                   <div className="flex items-center gap-2 opacity-40">
                      <Cpu size={10} className="text-accent md:w-3 md:h-3" />
                      <span className="text-[7px] md:text-[8px] font-code">Smart</span>
                   </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom: Scroll Indicator */}
            <motion.button
              onClick={handleNext}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-2 text-white/30 hover:text-accent transition-all group"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-[7px] md:text-[8px] font-code uppercase tracking-[0.4em] group-hover:tracking-[0.6em] transition-all">Engage</span>
              <ChevronDown size={20} className="md:w-6 md:h-6" />
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
            className="fixed inset-0 z-10 flex flex-col items-center md:items-start justify-center md:pl-[55%] pointer-events-none p-6"
          >
            <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[6px] md:tracking-[12px] text-gradient uppercase glow-purple mb-2 leading-none"
              >
                WEB DEVELOPMENT
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="max-w-xs md:max-w-md text-[9px] md:text-[11px] font-code text-white uppercase tracking-[0.3em] md:tracking-[0.5em] leading-relaxed"
              >
                Architecting digital empires with precision code and futuristic aesthetics.
              </motion.p>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="h-1 w-24 md:w-40 bg-accent mt-6 origin-center md:origin-left shadow-[0_0_20px_rgba(168,85,247,0.7)]"
              />
            </div>
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
            className="fixed inset-0 z-10 flex flex-col items-center md:items-start justify-center md:pl-[12%] pointer-events-none p-6"
          >
            <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[6px] md:tracking-[12px] text-gradient uppercase glow-purple mb-2 leading-none"
              >
                DIGITAL MARKETING
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="max-w-xs md:max-w-md text-[9px] md:text-[11px] font-code text-white uppercase tracking-[0.3em] md:tracking-[0.5em] leading-relaxed"
              >
                Engineering virality and market dominance through data-driven campaigns.
              </motion.p>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="h-1 w-24 md:w-40 bg-accent mt-6 origin-center md:origin-left shadow-[0_0_20px_rgba(168,85,247,0.7)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 HUD Layer 4: Contact Reveal */}
      <AnimatePresence mode="wait">
        {scene === 4 && (
          <motion.div 
            key="scene-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none overflow-y-auto p-4 md:p-10"
          >
            <div className="max-w-xl w-full flex flex-col items-center gap-6 md:gap-8 pointer-events-auto my-auto">
              <div className="text-center">
                <motion.h2 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[6px] md:tracking-[12px] text-gradient uppercase glow-purple mb-2 md:mb-4"
                >
                  COMMAND CENTER
                </motion.h2>
                <p className="text-[8px] md:text-[10px] font-code text-white/40 uppercase tracking-[0.3em] md:tracking-[0.5em]">Initiate Secure Communication</p>
              </div>

              <div className="w-full space-y-3 md:space-y-4 bg-black/40 backdrop-blur-3xl p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-accent/10 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <Input placeholder="AGENT NAME" className="bg-white/5 border-white/10 font-code text-[9px] md:text-[10px] h-10 md:h-12 rounded-xl focus:border-accent/50 focus:ring-accent/20" />
                  <Input placeholder="SECURE EMAIL" className="bg-white/5 border-white/10 font-code text-[9px] md:text-[10px] h-10 md:h-12 rounded-xl focus:border-accent/50 focus:ring-accent/20" />
                </div>
                <Textarea placeholder="ENCRYPTED MESSAGE..." className="bg-white/5 border-white/10 font-code text-[9px] md:text-[10px] min-h-[100px] md:min-h-[120px] rounded-xl focus:border-accent/50 focus:ring-accent/20" />
                <Button className="w-full bg-accent hover:bg-accent/80 text-black font-black tracking-[0.2em] md:tracking-[0.3em] h-10 md:h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  <Send size={14} className="mr-2 md:w-4 md:h-4" />
                  SEND TRANSMISSION
                </Button>
              </div>

              <div className="flex gap-6 md:gap-10 items-center justify-center">
                <motion.a 
                  whileHover={{ scale: 1.2, color: "#a855f7" }}
                  href="https://www.instagram.com/mixaura__?igsh=cGdtdGJoZzRoNXk0" 
                  target="_blank"
                  className="text-white/40 transition-colors"
                >
                  <Instagram size={20} className="md:w-6 md:h-6" />
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.2, color: "#a855f7" }}
                  href="https://www.facebook.com/share/1DkvUeKDKD/" 
                  target="_blank"
                  className="text-white/40 transition-colors"
                >
                  <Facebook size={20} className="md:w-6 md:h-6" />
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.2, color: "#a855f7" }}
                  href="https://wa.me/201020117504" 
                  target="_blank"
                  className="text-white/40 transition-colors"
                >
                  <MessageSquare size={20} className="md:w-6 md:h-6" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
