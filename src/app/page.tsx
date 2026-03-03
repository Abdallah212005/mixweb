
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
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Scene Transitions
  const scene1Opacity = useTransform(smoothProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const scene1Scale = useTransform(smoothProgress, [0, 0.3], [1, 0.8]);
  
  // Transition into City / Intelligence
  const scene2Opacity = useTransform(smoothProgress, [0.35, 0.45, 0.6, 0.7], [0, 1, 1, 0]);
  const scene2Y = useTransform(smoothProgress, [0.35, 0.45], [100, 0]);

  // Portfolio inside City
  const scene3Opacity = useTransform(smoothProgress, [0.7, 0.8, 0.9, 0.95], [0, 1, 1, 0]);
  const scene3Scale = useTransform(smoothProgress, [0.7, 0.8], [0.95, 1]);

  // Final Contact
  const scene4Opacity = useTransform(smoothProgress, [0.95, 0.98], [0, 1]);

  return (
    <main ref={containerRef} className="relative bg-[#050508] min-h-[500vh] w-full selection:bg-accent selection:text-black">
      <SceneBackground />

      <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="h-full w-full flex items-center justify-center p-6">
          
          {/* SCENE 1: THE AGENCY IDENTITY (SPACE) */}
          <motion.div 
            style={{ opacity: scene1Opacity, scale: scene1Scale }}
            className="text-center max-w-full absolute px-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <h1 className="text-7xl md:text-[12rem] font-black tracking-tighter text-white uppercase leading-[0.75]">
                MIX <br /> AURA
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.5 }}
              className="text-[9px] md:text-xs font-code tracking-[1.5em] md:tracking-[2em] text-accent uppercase ml-4 md:ml-8"
            >
              Full-Spectrum Influence
            </motion.p>
          </motion.div>

          {/* SCENE 2: CITY ENTRY - INTELLIGENCE */}
          <motion.div 
            style={{ opacity: scene2Opacity, y: scene2Y }}
            className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 pointer-events-auto items-center absolute px-6"
          >
            <div className="space-y-6 md:space-y-10 order-2 lg:order-1 text-center lg:text-left">
              <h2 className="text-5xl md:text-9xl font-black tracking-tighter leading-[0.8] uppercase">
                URBAN <br />
                <span className="text-accent">SYRIUS</span>
              </h2>
              <p className="text-lg md:text-xl text-white/60 max-w-md leading-relaxed font-medium mx-auto lg:mx-0">
                Infiltrating markets with bioluminescent logic. We don't just find an audience; we engineer the environment.
              </p>
              <div className="flex gap-6 items-center justify-center lg:justify-start">
                <div className="h-px w-20 md:w-32 bg-white/20" />
                <p className="text-[10px] md:text-[11px] font-code uppercase tracking-[0.4em] text-accent/60">Atmospheric Entry: Complete</p>
              </div>
            </div>
            <div className="w-full order-1 lg:order-2 flex justify-center">
              <div className="w-full max-w-md md:max-w-lg">
                <AICopyTool />
              </div>
            </div>
          </motion.div>

          {/* SCENE 3: PORTFOLIO CAPSULES (INSIDE CITY) */}
          <motion.div 
            style={{ opacity: scene3Opacity, scale: scene3Scale }}
            className="w-full max-w-7xl pointer-events-auto flex flex-col justify-center absolute inset-x-0 mx-auto px-6 overflow-y-auto md:overflow-hidden max-h-screen py-20"
          >
            <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-5xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8]">Impact</h2>
                <p className="text-accent/50 font-code uppercase tracking-[0.4em] md:tracking-[0.6em] text-[10px] md:text-[11px] mt-4 md:mt-6">Case Studies in Influence</p>
              </div>
              <div className="hidden lg:block text-[11px] font-code text-white/20 uppercase tracking-[0.4em]">
                City Grid: Active / Sector 07
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 pb-10">
              {PROJECTS.map((project, idx) => (
                <PortfolioPortal key={idx} project={project} index={idx} />
              ))}
            </div>
          </motion.div>

          {/* SCENE 4: FINAL COMMAND */}
          <motion.div 
            style={{ opacity: scene4Opacity }}
            className="w-full max-w-5xl pointer-events-auto absolute px-6"
          >
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-6xl md:text-[12rem] font-black tracking-tighter mb-4 md:mb-6 uppercase leading-none">COLLAB</h2>
              <p className="text-accent/40 font-code tracking-[0.6em] md:tracking-[0.8em] uppercase text-[10px] md:text-xs">Engineer Your Aura</p>
            </div>
            <ContactPanel />
          </motion.div>

        </div>
      </div>

      {/* HUD ELEMENTS */}
      <div className="fixed top-8 left-8 md:top-12 md:left-12 z-50 pointer-events-none hidden sm:block">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_10px_#C41BFD]" />
            <p className="text-[10px] md:text-[11px] font-code text-white uppercase tracking-[0.3em]">Neural Link: Active</p>
          </div>
          <div className="h-px w-16 md:w-20 bg-white/10" />
          <p className="text-[9px] md:text-[10px] font-code text-white/30 uppercase tracking-[0.5em]">Descent Mode</p>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 md:bottom-12 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none">
        <div className="h-24 md:h-32 w-[1px] bg-white/10 relative overflow-hidden">
          <motion.div 
            style={{ height: useTransform(smoothProgress, [0, 1], ["0%", "100%"]) }}
            className="w-full bg-accent shadow-[0_0_20px_#C41BFD]"
          />
        </div>
        <p className="text-[9px] md:text-[10px] font-code text-white/40 mt-6 md:mt-8 uppercase tracking-[0.6em] animate-bounce">Scroll to Infiltrate</p>
      </div>
    </main>
  );
}
