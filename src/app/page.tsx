
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { SceneBackground } from "@/components/three/SceneBackground";
import { PortfolioPortal } from "@/components/ui/PortfolioPortal";
import { AICopyTool } from "@/components/ui/AICopyTool";
import { ContactPanel } from "@/components/ui/ContactPanel";

const PROJECTS = [
  { title: "Celestial OS", category: "Core Infrastructure", image: "https://picsum.photos/seed/space1/800/1200" },
  { title: "StarMap Data", category: "Intelligence", image: "https://picsum.photos/seed/space2/800/1200" },
  { title: "Nebula Flow", category: "Cloud Ecosystems", image: "https://picsum.photos/seed/space3/800/1200" },
  { title: "Void Security", category: "Encryption", image: "https://picsum.photos/seed/space4/800/1200" },
];

export default function AuraForgePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Scene Visibility Transforms
  const scene1Opacity = useTransform(smoothProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const scene1Scale = useTransform(smoothProgress, [0, 0.2], [1, 1.1]);
  
  const scene2Opacity = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65], [0, 1, 1, 0]);
  const scene2Y = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65], [50, 0, 0, -50]);

  const scene3Opacity = useTransform(smoothProgress, [0.65, 0.75, 0.85, 0.9], [0, 1, 1, 0]);
  const scene3Scale = useTransform(smoothProgress, [0.65, 0.75], [0.98, 1]);

  const scene4Opacity = useTransform(smoothProgress, [0.9, 0.95], [0, 1]);

  return (
    <main ref={containerRef} className="relative bg-[#050508] min-h-[500vh]">
      <SceneBackground />

      {/* FIXED CONTENT LAYERS */}
      <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center p-6 md:p-12">
        
        {/* SCENE 1: THE ORIGIN */}
        <motion.div 
          style={{ opacity: scene1Opacity, scale: scene1Scale }}
          className="text-center max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="mb-6"
          >
            <h1 className="text-7xl md:text-[12rem] font-bold tracking-tighter text-white uppercase leading-[0.8]">
              MIX <br /> AURA
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.5 }}
            className="text-xs md:text-sm font-code tracking-[1.5em] text-accent/80 uppercase ml-4"
          >
            Digital Architects
          </motion.p>
        </motion.div>

        {/* SCENE 2: CELESTIAL INTELLIGENCE */}
        <motion.div 
          style={{ opacity: scene2Opacity, y: scene2Y }}
          className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pointer-events-auto items-center"
        >
          <div className="space-y-8">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              DATA <br />
              <span className="text-accent">AURA</span>
            </h2>
            <p className="text-lg text-white/60 max-w-sm leading-relaxed font-medium">
              Translating cosmic noise into digital dominance through refined intelligence.
            </p>
            <div className="flex gap-4">
              <div className="h-px flex-1 bg-white/10 self-center" />
              <p className="text-[10px] font-code uppercase tracking-widest text-accent/60">Node sync: active</p>
            </div>
          </div>
          <div className="relative">
            <AICopyTool />
          </div>
        </motion.div>

        {/* SCENE 3: STELLAR PORTFOLIO */}
        <motion.div 
          style={{ opacity: scene3Opacity, scale: scene3Scale }}
          className="w-full max-w-7xl pointer-events-auto h-full flex flex-col justify-center"
        >
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8]">Portals</h2>
              <p className="text-accent/60 font-code uppercase tracking-[0.5em] text-[10px] mt-4">Selected Explorations</p>
            </div>
            <div className="hidden md:block text-[10px] font-code text-white/20 uppercase tracking-[0.3em]">
              Orbit: 03 / Sector: Portfolio
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {PROJECTS.map((project, idx) => (
              <PortfolioPortal key={idx} project={project} index={idx} />
            ))}
          </div>
        </motion.div>

        {/* SCENE 4: COMMAND CENTER */}
        <motion.div 
          style={{ opacity: scene4Opacity }}
          className="w-full max-w-4xl pointer-events-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-6xl md:text-[10rem] font-black tracking-tighter mb-4 uppercase leading-none">IGNITE</h2>
            <p className="text-accent/60 font-code tracking-[0.6em] uppercase text-xs">Synchronize your vision</p>
          </div>
          <ContactPanel />
        </motion.div>

      </div>

      {/* STATUS HUD */}
      <div className="fixed top-12 left-12 z-50 pointer-events-none hidden md:block">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <p className="text-[10px] font-code text-white uppercase tracking-widest">Connection Live</p>
          </div>
          <div className="h-px w-24 bg-white/10" />
          <p className="text-[10px] font-code text-white/20 uppercase tracking-[0.4em]">Sector: Deep Space</p>
        </div>
      </div>

      {/* BOTTOM SCROLL INDICATOR */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none">
        <div className="h-24 w-[1px] bg-white/5 relative overflow-hidden">
          <motion.div 
            style={{ height: useTransform(smoothProgress, [0, 1], ["0%", "100%"]) }}
            className="w-full bg-accent shadow-[0_0_20px_#C41BFD]"
          />
        </div>
        <p className="text-[9px] font-code text-white/30 mt-6 uppercase tracking-[0.5em]">Scroll</p>
      </div>
    </main>
  );
}
