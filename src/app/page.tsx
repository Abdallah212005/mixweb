
"use client";

import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { SceneBackground } from "@/components/three/SceneBackground";
import { PortfolioPortal } from "@/components/ui/PortfolioPortal";
import { AICopyTool } from "@/components/ui/AICopyTool";
import { ContactPanel } from "@/components/ui/ContactPanel";

const PROJECTS = [
  { title: "Web Design stop_01", category: "UX/UI Resonance", image: "https://picsum.photos/seed/design/800/1200" },
  { title: "Web Development stop_02", category: "Full-Stack Neural", image: "https://picsum.photos/seed/dev/800/1200" },
  { title: "Graphic Design stop_03", category: "Visual Influence", image: "https://picsum.photos/seed/graphic/800/1200" },
  { title: "Media Buying stop_04", category: "Growth Infiltration", image: "https://picsum.photos/seed/ads/800/1200" },
];

export default function AuraForgePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 15,
    damping: 50,
    restDelta: 0.001
  });

  // Scene Transitions
  const scene1Opacity = useTransform(smoothProgress, [0, 0.25], [1, 0]);
  const scene2Opacity = useTransform(smoothProgress, [0.28, 0.4, 0.55, 0.65], [0, 1, 1, 0]);
  const scene3Opacity = useTransform(smoothProgress, [0.68, 0.78, 0.9, 0.95], [0, 1, 1, 0]);
  const scene4Opacity = useTransform(smoothProgress, [0.96, 1], [0, 1]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const totalHeight = document.body.scrollHeight;
        const currentScroll = window.scrollY;
        
        const anchors = [0, 0.45 * totalHeight, 0.8 * totalHeight, totalHeight];
        let targetIndex = 0;

        if (e.key === "ArrowDown") {
          targetIndex = anchors.findIndex(a => a > currentScroll + 300);
          if (targetIndex === -1) targetIndex = anchors.length - 1;
        } else {
          const reversed = [...anchors].reverse();
          const found = reversed.findIndex(a => a < currentScroll - 300);
          targetIndex = found === -1 ? 0 : (anchors.length - 1 - found);
        }

        window.scrollTo({ top: anchors[targetIndex], behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main ref={containerRef} className="relative bg-[#020205] min-h-[600vh] w-full selection:bg-accent selection:text-black">
      <SceneBackground />

      <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
        
        {/* SCENE 1: IDENTITY */}
        <motion.div style={{ opacity: scene1Opacity }} className="absolute inset-0 flex items-center justify-center p-6">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-[8rem] font-black text-white uppercase glow-purple leading-none mb-4"
            >
              MIX AURA
            </motion.h1>
            <p className="text-[8px] md:text-[10px] font-code tracking-[2em] text-accent uppercase">
              Architects of Digital Resonance
            </p>
          </div>
        </motion.div>

        {/* SCENE 2: STRATEGIST */}
        <motion.div style={{ opacity: scene2Opacity }} className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center md:text-left">
              <h2 className="text-4xl md:text-[5rem] font-black uppercase leading-[0.85]">
                DIGITAL <br /> <span className="text-accent">INTELLIGENCE</span>
              </h2>
              <p className="text-[10px] md:text-sm text-white/50 max-w-xs mx-auto md:mx-0 font-medium">
                Engineering hyper-growth systems where your brand's authority is absolute. Logic-driven, aura-enhanced.
              </p>
            </div>
            <div className="w-full pointer-events-auto flex justify-center scale-90 md:scale-100">
              <AICopyTool />
            </div>
          </div>
        </motion.div>

        {/* SCENE 3: RESONANCE (MANHATTAN) */}
        <motion.div style={{ opacity: scene3Opacity }} className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full max-w-6xl">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">RESONANCE</h2>
              <p className="text-accent/50 font-code tracking-[0.6em] text-[8px] md:text-[10px] mt-2">Strategic Infiltrations & Successes</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pointer-events-auto">
              {PROJECTS.map((project, idx) => (
                <PortfolioPortal key={idx} project={project} index={idx} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* SCENE 4: COLLAB */}
        <motion.div style={{ opacity: scene4Opacity }} className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full max-w-3xl pointer-events-auto scale-90">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-8xl font-black uppercase mb-2">COLLAB</h2>
              <p className="text-accent/40 font-code tracking-[0.8em] uppercase text-[8px] md:text-[10px]">Establish Your Global Digital Authority</p>
            </div>
            <ContactPanel />
          </div>
        </motion.div>
      </div>

      {/* HUD & NAVIGATION */}
      <div className="fixed top-12 left-12 z-50 pointer-events-none hidden md:block">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_12px_#C41BFD]" />
          <p className="text-[8px] font-code text-white/30 uppercase tracking-[0.5em]">SYSTEM_SYNC: {Math.round(smoothProgress.get() * 100)}%</p>
        </div>
      </div>

      <div className="fixed bottom-12 right-12 z-50 pointer-events-none hidden md:flex flex-col items-end gap-4">
        <p className="text-[7px] font-code text-white/20 uppercase tracking-[0.6em]">Nav: [↑↓]</p>
        <div className="space-y-1">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-0.5 transition-all duration-700 ${
                smoothProgress.get() > i * 0.25 - 0.1 && smoothProgress.get() < (i + 1) * 0.25 ? 'bg-accent h-8' : 'bg-white/10 h-4'
              }`} 
            />
          ))}
        </div>
      </div>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="h-16 w-[1px] bg-white/5 relative">
          <motion.div 
            style={{ height: useTransform(smoothProgress, [0, 1], ["0%", "100%"]) }}
            className="w-full bg-accent/40 shadow-[0_0_10px_#C41BFD]"
          />
        </div>
      </div>
    </main>
  );
}
