
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

  const scene1Opacity = useTransform(smoothProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const scene1Scale = useTransform(smoothProgress, [0, 0.2], [1, 1.1]);
  
  const scene2Opacity = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65], [0, 1, 1, 0]);
  const scene2Y = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65], [100, 0, 0, -100]);

  const scene3Opacity = useTransform(smoothProgress, [0.65, 0.75, 0.85, 0.9], [0, 1, 1, 0]);
  const scene3Scale = useTransform(smoothProgress, [0.65, 0.75], [0.95, 1]);

  const scene4Opacity = useTransform(smoothProgress, [0.9, 0.95], [0, 1]);

  return (
    <main ref={containerRef} className="relative bg-[#050508] min-h-[500vh] w-full selection:bg-accent selection:text-black">
      <SceneBackground />

      <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="h-full w-full flex items-center justify-center p-6">
          
          {/* SCENE 1: THE ORIGIN */}
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
              <h1 className="text-8xl md:text-[15rem] font-black tracking-tighter text-white uppercase leading-[0.75]">
                MIX <br /> AURA
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.5 }}
              className="text-[10px] md:text-xs font-code tracking-[2em] text-accent uppercase ml-8"
            >
              Digital Architects
            </motion.p>
          </motion.div>

          {/* SCENE 2: INTELLIGENCE */}
          <motion.div 
            style={{ opacity: scene2Opacity, y: scene2Y }}
            className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 pointer-events-auto items-center absolute px-6"
          >
            <div className="space-y-10 order-2 lg:order-1 text-center lg:text-left">
              <h2 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8] uppercase">
                EARTH <br />
                <span className="text-accent">RESONANCE</span>
              </h2>
              <p className="text-xl text-white/60 max-w-md leading-relaxed font-medium mx-auto lg:mx-0">
                Synchronizing planetary intelligence with bioluminescent digital infrastructure.
              </p>
              <div className="flex gap-6 items-center justify-center lg:justify-start">
                <div className="h-px w-32 bg-white/20" />
                <p className="text-[11px] font-code uppercase tracking-[0.4em] text-accent/60">Node sync: live</p>
              </div>
            </div>
            <div className="w-full order-1 lg:order-2 flex justify-center">
              <AICopyTool />
            </div>
          </motion.div>

          {/* SCENE 3: PORTALS */}
          <motion.div 
            style={{ opacity: scene3Opacity, scale: scene3Scale }}
            className="w-full max-w-7xl pointer-events-auto flex flex-col justify-center absolute inset-x-0 mx-auto px-6"
          >
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8]">Portals</h2>
                <p className="text-accent/50 font-code uppercase tracking-[0.6em] text-[11px] mt-6">Selected Explorations</p>
              </div>
              <div className="hidden lg:block text-[11px] font-code text-white/20 uppercase tracking-[0.4em]">
                Sector: Earth Orbit / 04
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {PROJECTS.map((project, idx) => (
                <PortfolioPortal key={idx} project={project} index={idx} />
              ))}
            </div>
          </motion.div>

          {/* SCENE 4: COMMAND */}
          <motion.div 
            style={{ opacity: scene4Opacity }}
            className="w-full max-w-5xl pointer-events-auto absolute px-6"
          >
            <div className="text-center mb-16">
              <h2 className="text-7xl md:text-[12rem] font-black tracking-tighter mb-6 uppercase leading-none">IGNITE</h2>
              <p className="text-accent/40 font-code tracking-[0.8em] uppercase text-xs">Establish the transmission</p>
            </div>
            <ContactPanel />
          </motion.div>

        </div>
      </div>

      {/* HUD ELEMENTS */}
      <div className="fixed top-12 left-12 z-50 pointer-events-none hidden md:block">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_10px_#C41BFD]" />
            <p className="text-[11px] font-code text-white uppercase tracking-[0.3em]">Neural Link: Active</p>
          </div>
          <div className="h-px w-20 bg-white/10" />
          <p className="text-[10px] font-code text-white/30 uppercase tracking-[0.5em]">Orbit: Sol-3</p>
        </div>
      </div>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none">
        <div className="h-32 w-[1px] bg-white/10 relative overflow-hidden">
          <motion.div 
            style={{ height: useTransform(smoothProgress, [0, 1], ["0%", "100%"]) }}
            className="w-full bg-accent shadow-[0_0_20px_#C41BFD]"
          />
        </div>
        <p className="text-[10px] font-code text-white/40 mt-8 uppercase tracking-[0.6em] animate-bounce">Scroll</p>
      </div>
    </main>
  );
}
