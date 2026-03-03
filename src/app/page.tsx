
"use client";

import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { SceneBackground } from "@/components/three/SceneBackground";
import { PortfolioPortal } from "@/components/ui/PortfolioPortal";
import { AICopyTool } from "@/components/ui/AICopyTool";
import { ContactPanel } from "@/components/ui/ContactPanel";

const PROJECTS = [
  { title: "Web Design", category: "Neural Visuals", image: "https://picsum.photos/seed/design/800/1200" },
  { title: "Web Development", category: "Full-Stack Architecture", image: "https://picsum.photos/seed/dev/800/1200" },
  { title: "Graphic Design", category: "Visual Influence", image: "https://picsum.photos/seed/graph/800/1200" },
  { title: "Media Buying", category: "Growth Infiltration", image: "https://picsum.photos/seed/media/800/1200" },
];

export default function AuraForgePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Snappy but smooth progress for UI elements
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 30,
    damping: 35,
    restDelta: 0.001
  });

  // Sync with background stages (Adjusted for slower entry)
  const scene1Opacity = useTransform(smoothProgress, [0, 0.25], [1, 0]);
  const scene2Opacity = useTransform(smoothProgress, [0.35, 0.5, 0.65], [0, 1, 0]);
  const scene3Opacity = useTransform(smoothProgress, [0.75, 0.88, 0.96], [0, 1, 0]);
  const scene4Opacity = useTransform(smoothProgress, [0.97, 1], [0, 1]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const totalHeight = containerRef.current?.scrollHeight || 0;
        const currentScroll = window.scrollY;
        
        // Define slide anchor points (Slower, weighted steps)
        const anchors = [0, 0.33 * totalHeight, 0.73 * totalHeight, totalHeight];
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
              transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-[6.5rem] font-black text-white uppercase glow-purple leading-none mb-4"
            >
              MIX AURA
            </motion.h1>
            <p className="text-[7px] md:text-[9px] font-code tracking-[2em] text-accent uppercase">
              Digital Influence Engineers
            </p>
          </div>
        </motion.div>

        {/* SCENE 2: STRATEGIST */}
        <motion.div style={{ opacity: scene2Opacity }} className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center md:text-left">
              <h2 className="text-3xl md:text-[4rem] font-black uppercase leading-[0.85]">
                DIGITAL <br /> <span className="text-accent">INTELLIGENCE</span>
              </h2>
              <p className="text-[9px] md:text-xs text-white/50 max-w-xs mx-auto md:mx-0 font-medium leading-relaxed">
                Designing neural architecture that scales brands beyond conventional limits. Absolute authority, absolute resonance.
              </p>
            </div>
            <div className="w-full pointer-events-auto flex justify-center scale-90 md:scale-95">
              <AICopyTool />
            </div>
          </div>
        </motion.div>

        {/* SCENE 3: RESONANCE (MANHATTAN GLIDE) */}
        <motion.div style={{ opacity: scene3Opacity }} className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full max-w-6xl">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">RESONANCE</h2>
              <p className="text-accent/50 font-code tracking-[0.6em] text-[7px] md:text-[9px] mt-2">Manhattan Digital Infiltration</p>
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
          <div className="w-full max-w-3xl pointer-events-auto scale-85">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-6xl font-black uppercase mb-2">COLLAB</h2>
              <p className="text-accent/40 font-code tracking-[0.8em] uppercase text-[7px] md:text-[9px]">Establish Your Global Command</p>
            </div>
            <ContactPanel />
          </div>
        </motion.div>
      </div>

      {/* HUD & NAVIGATION */}
      <div className="fixed top-12 left-12 z-50 pointer-events-none hidden md:block">
        <div className="flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-accent animate-pulse shadow-[0_0_12px_#C41BFD]" />
          <p className="text-[7px] font-code text-white/30 uppercase tracking-[0.5em]">SYNC_ACTIVE: {Math.round(smoothProgress.get() * 100)}%</p>
        </div>
      </div>

      <div className="fixed bottom-12 right-12 z-50 pointer-events-none hidden md:flex flex-col items-end gap-3">
        <p className="text-[6px] font-code text-white/20 uppercase tracking-[0.6em]">Manual: [↑↓]</p>
        <div className="space-y-1">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-0.5 transition-all duration-700 ${
                smoothProgress.get() > i * 0.25 - 0.1 && smoothProgress.get() < (i + 1) * 0.25 ? 'bg-accent h-6' : 'bg-white/10 h-3'
              }`} 
            />
          ))}
        </div>
      </div>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="h-12 w-[1px] bg-white/5 relative">
          <motion.div 
            style={{ height: useTransform(smoothProgress, [0, 1], ["0%", "100%"]) }}
            className="w-full bg-accent/40 shadow-[0_0_10px_#C41BFD]"
          />
        </div>
      </div>
    </main>
  );
}
