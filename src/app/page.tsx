
"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Instagram, Facebook, MessageSquare, Send, Globe, Cpu, Zap, ShieldCheck } from "lucide-react";
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

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
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
            className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none p-10"
          >
            {/* Top Left: System Status */}
            <div className="absolute top-10 left-10 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-code text-accent uppercase tracking-[0.3em]">System: Active</span>
              </div>
              <span className="text-[8px] font-code text-white/30 uppercase tracking-[0.2em]">Auth: Secure_Admin</span>
            </div>

            {/* Top Right: Coordinates */}
            <div className="absolute top-10 right-10 flex flex-col items-end gap-1 text-[8px] font-code text-white/30 uppercase tracking-[0.2em]">
              <span>LAT: 30.0444° N</span>
              <span>LON: 31.2357° E</span>
              <span className="text-accent/40 mt-1">Status: Orbital_Sync</span>
            </div>

            {/* Main Center Content */}
            <div className="relative text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative"
              >
                <div className="absolute -inset-10 bg-accent/5 blur-[80px] rounded-full" />
                <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter text-white uppercase leading-[0.8] drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  Mix <br /> 
                  <span className="text-accent glow-text">Aura</span>
                </h1>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex flex-col items-center gap-4"
              >
                <div className="h-px w-20 bg-accent/40" />
                <p className="text-[12px] md:text-[14px] font-code text-white/60 uppercase tracking-[0.8em]">
                  Architects of Digital Dominance
                </p>
                <div className="flex gap-8 mt-4">
                   <div className="flex items-center gap-2 opacity-40">
                      <Zap size={12} className="text-accent" />
                      <span className="text-[8px] font-code">Fast</span>
                   </div>
                   <div className="flex items-center gap-2 opacity-40">
                      <ShieldCheck size={12} className="text-accent" />
                      <span className="text-[8px] font-code">Secure</span>
                   </div>
                   <div className="flex items-center gap-2 opacity-40">
                      <Cpu size={12} className="text-accent" />
                      <span className="text-[8px] font-code">Smart</span>
                   </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom: Scroll Indicator */}
            <motion.button
              onClick={handleNext}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-2 text-white/30 hover:text-accent transition-all group"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-[8px] font-code uppercase tracking-[0.4em] group-hover:tracking-[0.6em] transition-all">Engage</span>
              <ChevronDown size={24} />
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
            className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="max-w-xl w-full px-6 flex flex-col items-center gap-8 pointer-events-auto">
              <div className="text-center">
                <motion.h2 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-5xl font-black tracking-[12px] text-gradient uppercase glow-purple mb-4"
                >
                  COMMAND CENTER
                </motion.h2>
                <p className="text-[10px] font-code text-white/40 uppercase tracking-[0.5em]">Initiate Secure Communication</p>
              </div>

              <div className="w-full space-y-4 bg-black/40 backdrop-blur-3xl p-8 rounded-[2rem] border border-accent/10 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="AGENT NAME" className="bg-white/5 border-white/10 font-code text-[10px] h-12 rounded-xl focus:border-accent/50 focus:ring-accent/20" />
                  <Input placeholder="SECURE EMAIL" className="bg-white/5 border-white/10 font-code text-[10px] h-12 rounded-xl focus:border-accent/50 focus:ring-accent/20" />
                </div>
                <Textarea placeholder="ENCRYPTED MESSAGE..." className="bg-white/5 border-white/10 font-code text-[10px] min-h-[120px] rounded-xl focus:border-accent/50 focus:ring-accent/20" />
                <Button className="w-full bg-accent hover:bg-accent/80 text-black font-black tracking-[0.3em] h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  <Send size={16} className="mr-2" />
                  SEND TRANSMISSION
                </Button>
              </div>

              <div className="flex gap-10 items-center justify-center">
                <motion.a 
                  whileHover={{ scale: 1.2, color: "#a855f7" }}
                  href="https://www.instagram.com/mixaura__?igsh=cGdtdGJoZzRoNXk0" 
                  target="_blank"
                  className="text-white/40 transition-colors"
                >
                  <Instagram size={24} />
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.2, color: "#a855f7" }}
                  href="https://www.facebook.com/share/1DkvUeKDKD/" 
                  target="_blank"
                  className="text-white/40 transition-colors"
                >
                  <Facebook size={24} />
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.2, color: "#a855f7" }}
                  href="https://wa.me/201020117504" 
                  target="_blank"
                  className="text-white/40 transition-colors"
                >
                  <MessageSquare size={24} />
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
