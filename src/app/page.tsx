
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { SceneBackground } from "@/components/three/SceneBackground";
import { PortfolioPortal } from "@/components/ui/PortfolioPortal";
import { AICopyTool } from "@/components/ui/AICopyTool";
import { ContactPanel } from "@/components/ui/ContactPanel";

const PROJECTS = [
  { title: "Meta & Google Growth", category: "Paid Advertising", image: "https://picsum.photos/seed/ads/800/1200" },
  { title: "Social Resonance", category: "Media Management", image: "https://picsum.photos/seed/social/800/1200" },
  { title: "Visual Identity", category: "Content Creation", image: "https://picsum.photos/seed/branding/800/1200" },
  { title: "Neural Commerce", category: "Web Development", image: "https://picsum.photos/seed/web/800/1200" },
];

export default function AuraForgePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 30,
    restDelta: 0.001
  });

  // Precise Scene Transitions for Continuous Motion
  const scene1Opacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const scene1Scale = useTransform(smoothProgress, [0, 0.2], [1, 0.8]);
  
  const scene2Opacity = useTransform(smoothProgress, [0.2, 0.3, 0.5, 0.6], [0, 1, 1, 0]);
  const scene2Y = useTransform(smoothProgress, [0.2, 0.35], [50, 0]);

  const scene3Opacity = useTransform(smoothProgress, [0.55, 0.65, 0.85, 0.9], [0, 1, 1, 0]);
  const scene3Scale = useTransform(smoothProgress, [0.55, 0.65], [0.9, 1]);

  const scene4Opacity = useTransform(smoothProgress, [0.9, 0.95], [0, 1]);
  const scene4Y = useTransform(smoothProgress, [0.9, 1], [30, 0]);

  return (
    <main ref={containerRef} className="relative bg-[#020205] min-h-[600vh] w-full selection:bg-accent selection:text-black">
      <SceneBackground />

      <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
        
        {/* SCENE 1: IDENTITY */}
        <motion.div 
          style={{ opacity: scene1Opacity, scale: scene1Scale }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <h1 className="text-6xl md:text-[10rem] lg:text-[12rem] font-black tracking-tighter text-white uppercase leading-[0.75] glow-purple">
                MIX <br /> AURA
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.5 }}
              className="text-[8px] md:text-xs font-code tracking-[1.5em] md:tracking-[2.5em] text-accent uppercase"
            >
              Architects of Digital Resonance
            </motion.p>
          </div>
        </motion.div>

        {/* SCENE 2: STRATEGIST (Capsule Tool) */}
        <motion.div 
          style={{ opacity: scene2Opacity, y: scene2Y }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full max-h-[85vh]">
            <div className="space-y-6 md:space-y-12 text-center lg:text-left">
              <h2 className="text-5xl md:text-[6rem] lg:text-[8rem] font-black tracking-tighter leading-[0.85] uppercase">
                DIGITAL <br />
                <span className="text-accent">INTELLIGENCE</span>
              </h2>
              <p className="text-sm md:text-xl text-white/60 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
                We engineer the environment where your brand dominates. From Paid Growth to Social Resonance, our logic is bioluminescent.
              </p>
              <div className="flex gap-6 items-center justify-center lg:justify-start">
                <div className="h-px w-16 md:w-32 bg-white/20" />
                <p className="text-[8px] md:text-[10px] font-code uppercase tracking-[0.4em] text-accent/60">Strategy Sync: Active</p>
              </div>
            </div>
            <div className="w-full pointer-events-auto flex justify-center lg:justify-end h-full">
              <AICopyTool />
            </div>
          </div>
        </motion.div>

        {/* SCENE 3: PORTFOLIO (Capsule Portals) */}
        <motion.div 
          style={{ opacity: scene3Opacity, scale: scene3Scale }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="w-full max-w-7xl h-full flex flex-col justify-center">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-5xl md:text-[6rem] lg:text-[8rem] font-black tracking-tighter uppercase leading-[0.85]">RESONANCE</h2>
                <p className="text-accent/50 font-code uppercase tracking-[0.6em] text-[8px] md:text-xs mt-4">Selected Case Studies & Services</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pointer-events-auto">
              {PROJECTS.map((project, idx) => (
                <PortfolioPortal key={idx} project={project} index={idx} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* SCENE 4: CONTACT (Capsule Panel) */}
        <motion.div 
          style={{ opacity: scene4Opacity, y: scene4Y }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="w-full max-w-5xl pointer-events-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-[8rem] lg:text-[10rem] font-black tracking-tighter mb-4 uppercase leading-none">COLLAB</h2>
              <p className="text-accent/40 font-code tracking-[0.6em] md:tracking-[0.8em] uppercase text-[8px] md:text-xs">Establish Your Neural Footprint</p>
            </div>
            <ContactPanel />
          </div>
        </motion.div>
      </div>

      {/* HUD ELEMENTS */}
      <div className="fixed top-8 left-8 md:top-12 md:left-12 z-50 pointer-events-none hidden sm:block">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_#C41BFD]" />
            <p className="text-[9px] font-code text-white/50 uppercase tracking-[0.4em]">Aura Link: Online</p>
          </div>
          <div className="h-px w-16 bg-white/10" />
          <p className="text-[8px] font-code text-white/20 uppercase tracking-[0.6em]">System Sync: {Math.round(smoothProgress.get() * 100)}%</p>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none">
        <div className="h-12 md:h-20 w-[1px] bg-white/10 relative overflow-hidden">
          <motion.div 
            style={{ height: useTransform(smoothProgress, [0, 1], ["0%", "100%"]) }}
            className="w-full bg-accent"
          />
        </div>
        <p className="text-[8px] font-code text-white/40 mt-4 md:mt-6 uppercase tracking-[0.6em] md:tracking-[0.8em] animate-bounce">Scroll</p>
      </div>
    </main>
  );
}
