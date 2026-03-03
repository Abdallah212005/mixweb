
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

  // Heavily damped physics for ultimate cinematic weight
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 15,
    damping: 45,
    restDelta: 0.001
  });

  // Scene Transitions mapping
  const scene1Opacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const scene1Scale = useTransform(smoothProgress, [0, 0.2], [1, 0.8]);
  
  const scene2Opacity = useTransform(smoothProgress, [0.22, 0.35, 0.5, 0.6], [0, 1, 1, 0]);
  const scene2Y = useTransform(smoothProgress, [0.22, 0.35], [50, 0]);

  const scene3Opacity = useTransform(smoothProgress, [0.65, 0.75, 0.88, 0.95], [0, 1, 1, 0]);
  const scene3Scale = useTransform(smoothProgress, [0.65, 0.8], [0.9, 1]);

  const scene4Opacity = useTransform(smoothProgress, [0.94, 0.99], [0, 1]);
  const scene4Y = useTransform(smoothProgress, [0.94, 1], [50, 0]);

  // Keyboard Navigation Logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const currentScroll = window.scrollY;
        const totalHeight = document.body.scrollHeight;
        
        // Target scroll positions for each scene
        const anchors = [0, 0.35 * totalHeight, 0.75 * totalHeight, totalHeight];
        
        let targetIndex = 0;
        if (e.key === "ArrowDown") {
          targetIndex = anchors.findIndex(a => a > currentScroll + 200);
          if (targetIndex === -1) targetIndex = anchors.length - 1;
        } else {
          const reversedAnchors = [...anchors].reverse();
          const found = reversedAnchors.findIndex(a => a < currentScroll - 200);
          targetIndex = found === -1 ? 0 : (anchors.length - 1 - found);
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
    <main ref={containerRef} className="relative bg-[#020205] min-h-[700vh] w-full selection:bg-accent selection:text-black">
      <SceneBackground />

      <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
        
        {/* SCENE 1: IDENTITY */}
        <motion.div 
          style={{ opacity: scene1Opacity, scale: scene1Scale }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
              className="mb-4 md:mb-6"
            >
              <h1 className="text-5xl md:text-[7rem] lg:text-[10rem] font-black tracking-tighter text-white uppercase leading-[0.75] glow-purple">
                MIX <br /> AURA
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1.5 }}
              className="text-[7px] md:text-[9px] font-code tracking-[1.5em] md:tracking-[2.5em] text-accent uppercase"
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
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-4xl md:text-[4rem] lg:text-[6rem] font-black tracking-tighter leading-[0.8] uppercase">
                DIGITAL <br />
                <span className="text-accent">INTELLIGENCE</span>
              </h2>
              <p className="text-[10px] md:text-base text-white/50 max-w-sm leading-relaxed font-medium mx-auto lg:mx-0">
                Engineering hyper-growth systems where your brand's authority is absolute. Logic-driven, aura-enhanced.
              </p>
              <div className="flex gap-4 items-center justify-center lg:justify-start">
                <div className="h-px w-10 md:w-16 bg-white/20" />
                <p className="text-[7px] md:text-[8px] font-code uppercase tracking-[0.4em] text-accent/60">AuraOS: Core Active</p>
              </div>
            </div>
            <div className="w-full pointer-events-auto flex justify-center lg:justify-end scale-90">
              <AICopyTool />
            </div>
          </div>
        </motion.div>

        {/* SCENE 3: PORTFOLIO */}
        <motion.div 
          style={{ opacity: scene3Opacity, scale: scene3Scale }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="w-full max-w-6xl">
            <div className="mb-6 md:mb-8 text-center md:text-left">
              <h2 className="text-4xl md:text-[4.5rem] lg:text-[6.5rem] font-black tracking-tighter uppercase leading-[0.8]">RESONANCE</h2>
              <p className="text-accent/50 font-code uppercase tracking-[0.5em] text-[7px] md:text-[9px] mt-2">Strategic Infiltrations & Successes</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pointer-events-auto">
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
          <div className="w-full max-w-3xl pointer-events-auto scale-90">
            <div className="text-center mb-6 md:mb-10">
              <h2 className="text-4xl md:text-[5rem] lg:text-[7rem] font-black tracking-tighter mb-2 uppercase leading-none">COLLAB</h2>
              <p className="text-accent/40 font-code tracking-[0.6em] md:tracking-[0.8em] uppercase text-[7px] md:text-[9px]">Establish Your Global Digital Authority</p>
            </div>
            <ContactPanel />
          </div>
        </motion.div>
      </div>

      {/* HUD ELEMENTS */}
      <div className="fixed top-8 left-8 md:top-12 md:left-12 z-50 pointer-events-none hidden sm:block">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_10px_#C41BFD]" />
            <p className="text-[8px] font-code text-white/40 uppercase tracking-[0.4em]">SYNCING: {Math.round(smoothProgress.get() * 100)}%</p>
          </div>
          <div className="h-px w-12 bg-white/10" />
        </div>
      </div>

      {/* NAVIGATION INDICATOR */}
      <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end gap-3 pointer-events-none hidden md:flex">
        <p className="text-[7px] font-code text-white/20 uppercase tracking-[0.5em]">Nav [↑↓]</p>
        <div className="space-y-1.5">
          {[0, 1, 2, 3].map((i) => {
             const progressValue = smoothProgress.get();
             const isActive = (progressValue > i * 0.25 - 0.1 && progressValue < (i + 1) * 0.25);
             return (
               <div 
                 key={i} 
                 className={`w-0.5 h-5 rounded-full transition-all duration-700 ${
                   isActive ? 'bg-accent shadow-[0_0_10px_#C41BFD] h-8' : 'bg-white/10'
                 }`} 
               />
             );
          })}
        </div>
      </div>

      {/* SCROLL BAR */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none">
        <div className="h-12 md:h-16 w-[1px] bg-white/5 relative overflow-hidden">
          <motion.div 
            style={{ height: useTransform(smoothProgress, [0, 1], ["0%", "100%"]) }}
            className="w-full bg-accent/40"
          />
        </div>
      </div>
    </main>
  );
}
