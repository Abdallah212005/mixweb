
"use client";

import React, { useRef, useEffect } from "react";
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
    stiffness: 45,
    damping: 25,
    restDelta: 0.001
  });

  // Scene Transitions
  const scene1Opacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const scene1Scale = useTransform(smoothProgress, [0, 0.2], [1, 0.8]);
  
  const scene2Opacity = useTransform(smoothProgress, [0.2, 0.35, 0.55, 0.65], [0, 1, 1, 0]);
  const scene2Y = useTransform(smoothProgress, [0.2, 0.4], [100, 0]);

  const scene3Opacity = useTransform(smoothProgress, [0.6, 0.7, 0.85, 0.95], [0, 1, 1, 0]);
  const scene3Scale = useTransform(smoothProgress, [0.6, 0.75], [0.85, 1]);

  const scene4Opacity = useTransform(smoothProgress, [0.92, 0.98], [0, 1]);
  const scene4Y = useTransform(smoothProgress, [0.92, 1], [100, 0]);

  // Keyboard Navigation Logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const currentScroll = window.scrollY;
        const viewportHeight = window.innerHeight;
        const totalHeight = document.body.scrollHeight;
        
        // Define slide anchor points (percentages of 600vh)
        const anchors = [0, 0.35 * totalHeight, 0.75 * totalHeight, totalHeight];
        
        let targetIndex = 0;
        if (e.key === "ArrowDown") {
          targetIndex = anchors.findIndex(a => a > currentScroll + 50);
          if (targetIndex === -1) targetIndex = anchors.length - 1;
        } else {
          targetIndex = anchors.reverse().findIndex(a => a < currentScroll - 50);
          targetIndex = targetIndex === -1 ? 0 : (anchors.length - 1 - targetIndex);
          anchors.reverse(); // Reset order
        }

        window.scrollTo({
          top: anchors[targetIndex],
          behavior: "smooth"
        });
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
          style={{ opacity: scene1Opacity, scale: scene1Scale }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 md:mb-10"
            >
              <h1 className="text-7xl md:text-[10rem] lg:text-[14rem] font-black tracking-tighter text-white uppercase leading-[0.7] glow-purple">
                MIX <br /> AURA
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.5 }}
              className="text-[9px] md:text-xs font-code tracking-[1.5em] md:tracking-[3em] text-accent uppercase"
            >
              Architects of Digital Resonance
            </motion.p>
          </div>
        </motion.div>

        {/* SCENE 2: STRATEGIST */}
        <motion.div 
          style={{ opacity: scene2Opacity, y: scene2Y }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 md:space-y-10 text-center lg:text-left">
              <h2 className="text-5xl md:text-[7rem] lg:text-[9rem] font-black tracking-tighter leading-[0.8] uppercase">
                DIGITAL <br />
                <span className="text-accent">INTELLIGENCE</span>
              </h2>
              <p className="text-sm md:text-xl text-white/60 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
                We engineer high-frequency environments where your brand dominates. From Growth Systems to Neural Commerce.
              </p>
              <div className="flex gap-4 md:gap-6 items-center justify-center lg:justify-start">
                <div className="h-px w-16 md:w-32 bg-white/20" />
                <p className="text-[9px] md:text-[11px] font-code uppercase tracking-[0.4em] text-accent/60">Logic: Active</p>
              </div>
            </div>
            <div className="w-full pointer-events-auto flex justify-center lg:justify-end">
              <AICopyTool />
            </div>
          </div>
        </motion.div>

        {/* SCENE 3: PORTFOLIO (NYC Context) */}
        <motion.div 
          style={{ opacity: scene3Opacity, scale: scene3Scale }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="w-full max-w-7xl">
            <div className="mb-8 md:mb-12 text-center md:text-left">
              <h2 className="text-5xl md:text-[7rem] lg:text-[9rem] font-black tracking-tighter uppercase leading-[0.8]">RESONANCE</h2>
              <p className="text-accent/50 font-code uppercase tracking-[0.5em] text-[8px] md:text-xs mt-4">Selected Strategic Infiltrations</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pointer-events-auto">
              {PROJECTS.map((project, idx) => (
                <PortfolioPortal key={idx} project={project} index={idx} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* SCENE 4: CONTACT */}
        <motion.div 
          style={{ opacity: scene4Opacity, y: scene4Y }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="w-full max-w-5xl pointer-events-auto">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-5xl md:text-[8rem] lg:text-[10rem] font-black tracking-tighter mb-4 uppercase leading-none">COLLAB</h2>
              <p className="text-accent/40 font-code tracking-[0.5em] md:tracking-[0.8em] uppercase text-[8px] md:text-xs">Establish Your Global Authority</p>
            </div>
            <ContactPanel />
          </div>
        </motion.div>
      </div>

      {/* HUD ELEMENTS */}
      <div className="fixed top-10 left-10 md:top-14 md:left-14 z-50 pointer-events-none hidden sm:block">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_10px_#C41BFD]" />
            <p className="text-[9px] font-code text-white/50 uppercase tracking-[0.4em]">AuraOS: {Math.round(smoothProgress.get() * 100)}%</p>
          </div>
          <div className="h-px w-16 bg-white/10" />
        </div>
      </div>

      {/* NAVIGATION INDICATOR */}
      <div className="fixed bottom-12 right-12 z-50 flex flex-col items-end gap-4 pointer-events-none hidden md:flex">
        <p className="text-[8px] font-code text-white/30 uppercase tracking-[0.5em]">Nav [↑↓]</p>
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
             <div 
               key={i} 
               className={`w-1 h-8 rounded-full transition-all duration-500 ${
                 (smoothProgress.get() > i * 0.25 - 0.1 && smoothProgress.get() < (i + 1) * 0.25) ? 'bg-accent shadow-[0_0_10px_#C41BFD]' : 'bg-white/10'
               }`} 
             />
          ))}
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none">
        <div className="h-12 md:h-20 w-[1px] bg-white/10 relative overflow-hidden">
          <motion.div 
            style={{ height: useTransform(smoothProgress, [0, 1], ["0%", "100%"]) }}
            className="w-full bg-accent"
          />
        </div>
      </div>
    </main>
  );
}
