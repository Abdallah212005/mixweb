
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import dynamic from "next/dynamic";
import { PortfolioPortal } from "@/components/ui/PortfolioPortal";
import { PlaceHolderImages } from "@/lib/placeholder-images";

// Import SceneBackground dynamically to prevent SSR issues with Three.js
const SceneBackground = dynamic(
  () => import("@/components/three/SceneBackground").then((mod) => mod.SceneBackground),
  { ssr: false }
);

// Realistic Jagged Lightning Bolt component
const LightningBolt = () => {
  const [path, setPath] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const generatePath = () => {
      const isHorizontal = Math.random() > 0.5;
      let startX, startY;
      
      if (isHorizontal) {
        startX = 35 + Math.random() * 30;
        startY = Math.random() > 0.5 ? 45 : 55;
      } else {
        startX = Math.random() > 0.5 ? 35 : 65;
        startY = 48 + Math.random() * 4;
      }
      
      let currentX = startX;
      let currentY = startY;
      let newPath = `M ${startX} ${startY}`;
      
      const segments = 8;
      for (let i = 1; i <= segments; i++) {
        const targetX = startX + (Math.random() - 0.5) * 15;
        const targetY = startY + (Math.random() - 0.5) * 15;
        const jitterX = (Math.random() - 0.5) * 10;
        const jitterY = (Math.random() - 0.5) * 10;
        
        currentX = targetX + jitterX;
        currentY = targetY + jitterY;
        newPath += ` L ${currentX} ${currentY}`;
      }
      return newPath;
    };

    const triggerBolt = () => {
      if (Math.random() > 0.6) {
        setPath(generatePath());
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 100 + Math.random() * 150);
      }
    };
    
    const interval = setInterval(triggerBolt, 350);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.svg
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.7, 1, 0] }}
      transition={{ duration: 0.2 }}
    >
      <path
        d={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="0.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 10px #C41BFD) drop-shadow(0 0 18px #C41BFD)" }}
      />
    </motion.svg>
  );
};

export default function AuraForgePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 25,
    damping: 40,
    restDelta: 0.001
  });

  // Hydration-safe scroll percentage update
  useEffect(() => {
    if (!isMounted) return;
    const unsubscribe = smoothProgress.on("change", (latest) => {
      setScrollPercent(Math.round(latest * 100));
    });
    return () => unsubscribe();
  }, [smoothProgress, isMounted]);

  // Scene Transform Definitions
  const scene1Opacity = useTransform(smoothProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const scene2Opacity = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65], [0, 1, 1, 0]);
  const scene3Opacity = useTransform(smoothProgress, [0.65, 0.75, 1.0], [0, 1, 1]);

  const scene2Y = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65], [100, 0, 0, -100]);
  const scene3Y = useTransform(smoothProgress, [0.65, 0.75, 1.0], [100, 0, 0]);

  const snapPoints = [0, 0.45, 0.8];
  
  const navigateToSection = useCallback((direction: 'next' | 'prev') => {
    const currentProgress = scrollYProgress.get();
    let targetIndex;
    
    if (direction === "next") {
      targetIndex = snapPoints.findIndex(p => p > currentProgress + 0.05);
      if (targetIndex === -1) targetIndex = snapPoints.length - 1;
    } else {
      const reversedPoints = [...snapPoints].reverse();
      const found = reversedPoints.find(p => p < currentProgress - 0.05);
      targetIndex = found !== undefined ? snapPoints.indexOf(found) : 0;
    }

    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = snapPoints[targetIndex] * totalHeight;
    
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth"
    });
  }, [scrollYProgress]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        navigateToSection("next");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        navigateToSection("prev");
      }
    };

    let touchStart = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEnd = e.changedTouches[0].clientY;
      const diff = touchStart - touchEnd;
      if (Math.abs(diff) > 70) {
        if (diff > 0) navigateToSection("next");
        else navigateToSection("prev");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [navigateToSection]);

  const PROJECTS = [
    { 
      title: "Web Design", 
      category: "Digital Architecture", 
      image: PlaceHolderImages.find(img => img.id === 'web-design')?.imageUrl || "" 
    },
    { 
      title: "Web Development", 
      category: "Neural Coding", 
      image: PlaceHolderImages.find(img => img.id === 'web-dev')?.imageUrl || "" 
    },
    { 
      title: "Graphic Design", 
      category: "Visual Influence", 
      image: PlaceHolderImages.find(img => img.id === 'graphic-design')?.imageUrl || "" 
    },
    { 
      title: "Media Buying", 
      category: "Growth Infiltration", 
      image: PlaceHolderImages.find(img => img.id === 'media-buying')?.imageUrl || "" 
    },
  ];

  return (
    <main ref={containerRef} className="relative bg-black min-h-[400vh] w-full selection:bg-accent selection:text-black">
      <SceneBackground />

      <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
        
        {/* SCENE 1: IDENTITY */}
        <motion.div 
          style={{ opacity: scene1Opacity }} 
          className="absolute inset-0 flex flex-col items-center justify-center p-6"
        >
          <div className="text-center relative flex flex-col items-center">
            <LightningBolt />
            <LightningBolt />
            <LightningBolt />
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="relative"
            >
              <h1 className="text-6xl md:text-[8.5rem] font-black text-white uppercase leading-none tracking-tighter relative z-10 
                [text-shadow:0_1px_0_#ccc,0_2px_0_#c9c9c9,0_3px_0_#bbb,0_4px_0_#b9b9b9,0_5px_0_#aaa,0_6px_1px_rgba(0,0,0,.1),0_0_5px_rgba(0,0,0,.1),0_1px_3px_rgba(0,0,0,.3),0_3px_5px_rgba(0,0,0,.2),0_5px_10px_rgba(0,0,0,.25),0_10px_10px_rgba(0,0,0,.2),0_20px_20px_rgba(0,0,0,.15),0_0_30px_#C41BFD,0_0_60px_rgba(196,27,253,0.4)]
              ">
                MIX AURA
              </h1>
            </motion.div>

            <div className="mt-8 flex flex-col items-center">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 1, duration: 2 }}
                className="font-code tracking-[0.8em] text-accent uppercase text-center text-[10px] md:text-sm mb-8 glow-purple"
              >
                Start Like a Pro
              </motion.p>
              
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className="flex justify-center space-x-6 pointer-events-auto relative z-30"
              >
                  <motion.a 
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(196, 27, 253, 0.15)", boxShadow: "0 0 20px rgba(196, 27, 253, 0.4)" }}
                    whileTap={{ scale: 0.9 }}
                    href="https://www.instagram.com/mixaura__?igsh=cGdtdGJoZzRoNXk0" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center p-3 rounded-full border border-accent/20 text-accent backdrop-blur-md transition-shadow duration-150 cursor-pointer select-none"
                  >
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6 pointer-events-none">
                          <title>Instagram</title>
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                  </motion.a>

                  <motion.a 
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(196, 27, 253, 0.15)", boxShadow: "0 0 20px rgba(196, 27, 253, 0.4)" }}
                    whileTap={{ scale: 0.9 }}
                    href="https://www.facebook.com/share/1DkvUeKDKD/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center p-3 rounded-full border border-accent/20 text-accent backdrop-blur-md transition-shadow duration-150 cursor-pointer select-none"
                  >
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6 pointer-events-none">
                          <title>Facebook</title>
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                  </motion.a>

                  <motion.a 
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(196, 27, 253, 0.15)", boxShadow: "0 0 20px rgba(196, 27, 253, 0.4)" }}
                    whileTap={{ scale: 0.9 }}
                    href="https://wa.me/201020117504" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center p-3 rounded-full border border-accent/20 text-accent backdrop-blur-md transition-shadow duration-150 cursor-pointer select-none"
                  >
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6 pointer-events-none">
                          <title>WhatsApp</title>
                          <path d="M19.05 4.94A12 12 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.1.54 4.07 1.48 5.74L0 24l6.33-1.65A11.9 11.9 0 0 0 12 24c6.63 0 12-5.37 12-12a11.93 11.93 0 0 0-4.95-9.06zM12 21.76c-1.9 0-3.69-.5-5.23-1.39L4.4 21.2l.85-2.27a9.83 9.83 0 0 1-1.5-5.01c0-5.42 4.39-9.8 9.8-9.8s9.8 4.38 9.8 9.8-4.39 9.8-9.8 9.8zm4.7-6.59c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.62.13-.19.26-.7.88-.86 1.06-.16.18-.32.2-.59.06-.27-.13-1.14-.42-2.18-1.34-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.3.4-.4.07-.06.13-.13.2-.21.12-.13.06-.26-.03-.45s-.62-1.49-.85-2.04c-.23-.55-.46-.48-.62-.49-.15-.01-.32-.01-.49-.01-.17 0-.44.06-.67.33-.23.26-.88.85-1.08 2.06-.2.1.2 1.45 2.1 3.58 1.8 1.9 2.92 2.5 3.3 2.7.38.2.72.17.97.11.25-.06.78-.32.89-.63.11-.3.11-.56.08-.62-.03-.06-.15-.1-.23-.16z"/>
                      </svg>
                  </motion.a>
              </motion.div>
            </div>
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

      </div>

      {/* HUD & NAVIGATION */}
      <div className="fixed top-12 left-12 z-50 pointer-events-none hidden md:block">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_15px_#C41BFD]" />
          <div>
            <p className="text-[7px] font-code text-white/40 uppercase tracking-[0.5em]">SYSTEM_SYNC</p>
            <p className="text-[10px] font-code text-white uppercase">{isMounted ? `${scrollPercent}%` : '0%'}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
