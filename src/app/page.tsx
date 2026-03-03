
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { SceneBackground } from "@/components/three/SceneBackground";
import { PortfolioPortal } from "@/components/ui/PortfolioPortal";
import { AICopyTool } from "@/components/ui/AICopyTool";
import { ContactPanel } from "@/components/ui/ContactPanel";

const PROJECTS = [
  { title: "NeuroSync", category: "Neural Networks", image: "https://picsum.photos/seed/123/800/1000" },
  { title: "NeonFlow", category: "Digital Marketing", image: "https://picsum.photos/seed/456/800/1000" },
  { title: "AuraOS", category: "Web Ecosystems", image: "https://picsum.photos/seed/789/800/1000" },
  { title: "CyberMesh", category: "Blockchain", image: "https://picsum.photos/seed/101/800/1000" },
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
  const scene1Opacity = useTransform(smoothProgress, [0, 0.2, 0.25], [1, 1, 0]);
  const scene1Scale = useTransform(smoothProgress, [0, 0.2], [1, 1.2]);
  
  const scene2Opacity = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65], [0, 1, 1, 0]);
  const scene2Y = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65], [100, 0, 0, -100]);

  const scene3Opacity = useTransform(smoothProgress, [0.65, 0.75, 0.85, 0.9], [0, 1, 1, 0]);
  const scene3Scale = useTransform(smoothProgress, [0.65, 0.75], [0.95, 1]);

  const scene4Opacity = useTransform(smoothProgress, [0.9, 0.95], [0, 1]);

  return (
    <main ref={containerRef} className="relative bg-[#100E11] min-h-[500vh]">
      <SceneBackground />

      {/* FIXED CONTENT LAYERS */}
      <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center p-6">
        
        {/* SCENE 1: THE BIRTH OF AN AURA */}
        <motion.div 
          style={{ opacity: scene1Opacity, scale: scene1Scale }}
          className="text-center max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-primary/50 uppercase">
              MIX AURA
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="text-xl md:text-2xl font-light tracking-[0.5em] text-accent uppercase"
          >
            We Engineer Digital Influence
          </motion.p>
          <motion.div 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mt-12 w-px h-24 bg-gradient-to-b from-primary to-transparent mx-auto"
          />
        </motion.div>

        {/* SCENE 2: DIGITAL INTELLIGENCE */}
        <motion.div 
          style={{ opacity: scene2Opacity, y: scene2Y }}
          className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 pointer-events-auto"
        >
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              NEURAL <br />
              <span className="text-primary italic">ORCHESTRATION</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Our intelligence doesn't just process data—it sculpts it. 
              We utilize advanced algorithms to dominate digital landscapes 
              through controlled creative chaos.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                <h4 className="font-code text-accent text-xs mb-2 uppercase">Core System 01</h4>
                <p className="text-sm font-bold">Digital Marketing</p>
              </div>
              <div className="p-4 border border-accent/20 bg-accent/5 rounded-lg">
                <h4 className="font-code text-primary text-xs mb-2 uppercase">Core System 02</h4>
                <p className="text-sm font-bold">Web Development</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <AICopyTool />
            {/* Visual flare */}
            <div className="absolute -z-10 -top-20 -right-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
          </div>
        </motion.div>

        {/* SCENE 3: PORTFOLIO PORTALS */}
        <motion.div 
          style={{ opacity: scene3Opacity, scale: scene3Scale }}
          className="w-full max-w-7xl pointer-events-auto overflow-hidden h-full flex flex-col justify-center"
        >
          <div className="mb-12">
            <h2 className="text-4xl md:text-7xl font-bold tracking-tighter mb-4">PORTALS</h2>
            <p className="text-accent font-code uppercase tracking-widest text-sm">Case Studies of Dominance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {PROJECTS.map((project, idx) => (
              <PortfolioPortal key={idx} project={project} index={idx} />
            ))}
          </div>
        </motion.div>

        {/* SCENE 4: CONTROL CENTER */}
        <motion.div 
          style={{ opacity: scene4Opacity }}
          className="w-full max-w-4xl pointer-events-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter mb-4 uppercase">Initialize</h2>
            <p className="text-accent font-code tracking-[0.3em] uppercase">Ready to amplify your aura?</p>
          </div>
          <ContactPanel />
        </motion.div>

      </div>

      {/* BOTTOM NAV / STATUS */}
      <div className="fixed bottom-8 left-8 right-8 z-50 flex justify-between items-end pointer-events-none">
        <div className="space-y-1">
          <p className="text-[10px] font-code text-primary/60 uppercase">System Status: Optimal</p>
          <p className="text-[10px] font-code text-white/40 uppercase">AuraForge Core v2.5.0</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="h-12 w-[1px] bg-primary/30 relative overflow-hidden">
            <motion.div 
              style={{ height: useTransform(smoothProgress, [0, 1], ["0%", "100%"]) }}
              className="w-full bg-primary"
            />
          </div>
          <p className="text-[10px] font-code text-accent mt-2 uppercase">Scroll to Sync</p>
        </div>
      </div>
    </main>
  );
}
