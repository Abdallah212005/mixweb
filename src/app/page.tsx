
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { SceneBackground } from "@/components/three/SceneBackground";
import { PortfolioPortal } from "@/components/ui/PortfolioPortal";
import { AICopyTool } from "@/components/ui/AICopyTool";
import { ContactPanel } from "@/components/ui/ContactPanel";

const PROJECTS = [
  { title: "Vanguard Strategy", category: "Global Growth", image: "https://picsum.photos/seed/agency1/800/1200" },
  { title: "Lumina Brand", category: "Identity Design", image: "https://picsum.photos/seed/agency2/800/1200" },
  { title: "Nexus Social", category: "Content Ecosystem", image: "https://picsum.photos/seed/agency3/800/1200" },
  { title: "Aura Commerce", category: "Digital Sales", image: "https://picsum.photos/seed/agency4/800/1200" },
];

export default function AuraForgePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  });

  // Scene Transitions - Refined for stability
  const scene1Opacity = useTransform(smoothProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const scene1Scale = useTransform(smoothProgress, [0, 0.25], [1, 0.9]);
  
  const scene2Opacity = useTransform(smoothProgress, [0.3, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const scene2Y = useTransform(smoothProgress, [0.3, 0.4], [50, 0]);

  const scene3Opacity = useTransform(smoothProgress, [0.75, 0.85, 0.92, 0.95], [0, 1, 1, 0]);
  const scene3Scale = useTransform(smoothProgress, [0.75, 0.85], [0.98, 1]);

  const scene4Opacity = useTransform(smoothProgress, [0.96, 0.99], [0, 1]);

  return (
    <main ref={containerRef} className="relative bg-[#020205] min-h-[600vh] w-full selection:bg-accent selection:text-black">
      <SceneBackground />

      {/* FIXED SCENE ENGINE */}
      <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
        
        {/* SCENE 1: IDENTITY */}
        <motion.div 
          style={{ opacity: scene1Opacity, scale: scene1Scale }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <h1 className="text-7xl md:text-[14rem] font-black tracking-tighter text-white uppercase leading-[0.7] glow-purple">
                MIX <br /> AURA
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.5 }}
              className="text-[9px] md:text-xs font-code tracking-[2em] text-accent uppercase"
            >
              Architects of Digital Resonance
            </motion.p>
          </div>
        </motion.div>

        {/* SCENE 2: STRATEGIST (CITY ENTRY) */}
        <motion.div 
          style={{ opacity: scene2Opacity, y: scene2Y }}
          className="absolute inset-0 flex items-center justify-center p-6 pointer-events-auto"
        >
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="space-y-6 md:space-y-12 order-2 lg:order-1 text-center lg:text-left">
              <h2 className="text-5xl md:text-[10rem] font-black tracking-tighter leading-[0.8] uppercase">
                URBAN <br />
                <span className="text-accent">MATRIX</span>
              </h2>
              <p className="text-lg md:text-2xl text-white/60 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
                Infiltrating markets with bioluminescent logic. We engineer the environment where your brand lives.
              </p>
              <div className="flex gap-6 items-center justify-center lg:justify-start">
                <div className="h-px w-24 md:w-40 bg-white/20" />
                <p className="text-[10px] md:text-[11px] font-code uppercase tracking-[0.4em] text-accent/60">Node Connection: Established</p>
              </div>
            </div>
            <div className="w-full order-1 lg:order-2 flex justify-center lg:justify-end">
              <AICopyTool />
            </div>
          </div>
        </motion.div>

        {/* SCENE 3: PORTFOLIO CAPSULES */}
        <motion.div 
          style={{ opacity: scene3Opacity, scale: scene3Scale }}
          className="absolute inset-0 flex items-center justify-center p-6 pointer-events-auto"
        >
          <div className="w-full max-w-7xl h-full flex flex-col justify-center">
            <div className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-6xl md:text-[10rem] font-black tracking-tighter uppercase leading-[0.8]">RESONANCE</h2>
                <p className="text-accent/50 font-code uppercase tracking-[0.6em] text-[10px] md:text-xs mt-6">Global Influence Case Studies</p>
              </div>
              <div className="hidden lg:block text-[11px] font-code text-white/20 uppercase tracking-[0.4em]">
                City Grid Sector 07 / Active
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 max-h-[70vh] md:max-h-none overflow-y-auto md:overflow-visible px-4 custom-scrollbar">
              {PROJECTS.map((project, idx) => (
                <PortfolioPortal key={idx} project={project} index={idx} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* SCENE 4: FINAL COLLAB */}
        <motion.div 
          style={{ opacity: scene4Opacity }}
          className="absolute inset-0 flex items-center justify-center p-6 pointer-events-auto overflow-y-auto"
        >
          <div className="w-full max-w-5xl my-auto">
            <div className="text-center mb-12 md:mb-24">
              <h2 className="text-7xl md:text-[14rem] font-black tracking-tighter mb-4 md:mb-8 uppercase leading-none">COLLAB</h2>
              <p className="text-accent/40 font-code tracking-[0.8em] uppercase text-[10px] md:text-sm">Establish Your Neural Footprint</p>
            </div>
            <ContactPanel />
          </div>
        </motion.div>
      </div>

      {/* HUD ELEMENTS */}
      <div className="fixed top-8 left-8 md:top-16 md:left-16 z-50 pointer-events-none hidden sm:block">
        <div className="space-y-6 md:space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_15px_#C41BFD]" />
            <p className="text-[10px] md:text-xs font-code text-white uppercase tracking-[0.4em]">Aura Link: Online</p>
          </div>
          <div className="h-px w-24 md:w-32 bg-white/10" />
          <p className="text-[9px] md:text-[10px] font-code text-white/30 uppercase tracking-[0.6em]">Orbital Position: 04</p>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none">
        <div className="h-28 md:h-40 w-[1px] bg-white/10 relative overflow-hidden">
          <motion.div 
            style={{ height: useTransform(smoothProgress, [0, 1], ["0%", "100%"]) }}
            className="w-full bg-accent shadow-[0_0_20px_#C41BFD]"
          />
        </div>
        <p className="text-[10px] md:text-xs font-code text-white/40 mt-8 uppercase tracking-[0.8em] animate-bounce">Scroll to Descent</p>
      </div>
    </main>
  );
}
