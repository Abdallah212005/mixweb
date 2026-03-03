
"use client";

import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { SceneBackground } from "@/components/three/SceneBackground";
import { PortfolioPortal } from "@/components/ui/PortfolioPortal";
import { AICopyTool } from "@/components/ui/AICopyTool";
import { ContactPanel } from "@/components/ui/ContactPanel";

const PROJECTS = [
  { title: "Web Design", category: "Digital Architecture", image: "https://picsum.photos/seed/design/800/1200" },
  { title: "Web Development", category: "Neural Coding", image: "https://picsum.photos/seed/dev/800/1200" },
  { title: "Graphic Design", category: "Visual Influence", image: "https://picsum.photos/seed/graph/800/1200" },
  { title: "Media Buying", category: "Growth Infiltration", image: "https://picsum.photos/seed/media/800/1200" },
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

  // Precise Scene Opacity Mapping for Clean Transitions
  const scene1Opacity = useTransform(smoothProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const scene2Opacity = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65], [0, 1, 1, 0]);
  const scene3Opacity = useTransform(smoothProgress, [0.65, 0.75, 0.88, 0.95], [0, 1, 1, 0]);
  const scene4Opacity = useTransform(smoothProgress, [0.95, 0.98], [0, 1]);

  // UI Scale/Y Transforms for "Floating" Effect
  const scene2Y = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65], [100, 0, 0, -100]);
  const scene3Y = useTransform(smoothProgress, [0.65, 0.75, 0.88, 0.95], [100, 0, 0, -100]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const totalHeight = containerRef.current?.scrollHeight || 0;
        const currentScroll = window.scrollY;
        
        // Logical Anchors matching the Scroll Progress Ranges
        const anchors = [0, 0.4 * totalHeight, 0.8 * totalHeight, totalHeight];
        let targetIndex = 0;

        if (e.key === "ArrowDown") {
          targetIndex = anchors.findIndex(a => a > currentScroll + 50);
          if (targetIndex === -1) targetIndex = anchors.length - 1;
        } else {
          const reversed = [...anchors].reverse();
          const found = reversed.findIndex(a => a < currentScroll - 50);
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
        <motion.div 
          style={{ opacity: scene1Opacity }} 
          className="absolute inset-0 flex flex-col items-center justify-center p-6"
        >
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-[7rem] font-black text-white uppercase glow-purple leading-none mb-4 tracking-tighter"
            >
              MIX AURA
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1, duration: 2 }}
              className="text-[6px] md:text-[8px] font-code tracking-[2.5em] text-accent uppercase"
            >
              Digital Influence Engineers
            </motion.p>
          </div>
        </motion.div>

        {/* SCENE 2: STRATEGIST */}
        <motion.div 
          style={{ opacity: scene2Opacity, y: scene2Y }} 
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center md:text-left">
              <h2 className="text-4xl md:text-[5.5rem] font-black uppercase leading-[0.8] tracking-tighter">
                DIGITAL <br /> <span className="text-accent">INTELLIGENCE</span>
              </h2>
              <p className="text-[9px] md:text-[12px] text-white/40 max-w-xs mx-auto md:mx-0 font-medium leading-relaxed uppercase tracking-wider">
                Neural architecture scaling brands beyond conventional limits. Absolute authority.
              </p>
            </div>
            <div className="w-full pointer-events-auto flex justify-center scale-95 lg:scale-100">
              <AICopyTool />
            </div>
          </div>
        </motion.div>

        {/* SCENE 3: RESONANCE */}
        <motion.div 
          style={{ opacity: scene3Opacity, y: scene3Y }} 
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="w-full max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">RESONANCE</h2>
              <p className="text-accent/50 font-code tracking-[1em] text-[8px] md:text-[10px] uppercase">Infiltrating Global Markets</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pointer-events-auto">
              {PROJECTS.map((project, idx) => (
                <PortfolioPortal key={idx} project={project} index={idx} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* SCENE 4: COLLAB */}
        <motion.div 
          style={{ opacity: scene4Opacity }} 
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="w-full max-w-4xl pointer-events-auto scale-90 lg:scale-100">
            <div className="text-center mb-10">
              <h2 className="text-5xl md:text-7xl font-black uppercase mb-4 tracking-tighter">ESTABLISH COMMAND</h2>
              <p className="text-accent/40 font-code tracking-[1.2em] uppercase text-[8px] md:text-[11px]">Initiate Global Operations</p>
            </div>
            <ContactPanel />
          </div>
        </motion.div>
      </div>

      {/* HUD & NAVIGATION */}
      <div className="fixed top-12 left-12 z-50 pointer-events-none hidden md:block">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_15px_#C41BFD]" />
          <div>
            <p className="text-[7px] font-code text-white/40 uppercase tracking-[0.5em]">SYSTEM_SYNC</p>
            <p className="text-[10px] font-code text-white uppercase">{Math.round(smoothProgress.get() * 100)}%</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-12 right-12 z-50 pointer-events-none hidden md:flex flex-col items-end gap-4">
        <p className="text-[6px] font-code text-white/20 uppercase tracking-[0.8em] mb-2">Scroll to Navigate</p>
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-1 transition-all duration-700 rounded-full ${
                smoothProgress.get() > i * 0.25 - 0.1 && smoothProgress.get() < (i + 1) * 0.25 
                ? 'bg-accent h-12 shadow-[0_0_15px_#C41BFD]' 
                : 'bg-white/5 h-6'
              }`} 
            />
          ))}
        </div>
      </div>
    </main>
  );
}
