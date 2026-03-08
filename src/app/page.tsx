
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Instagram, Facebook, MessageSquare, Send, Zap, ShieldCheck, Cpu, Loader2, Globe, Hotel, Sofa, Dumbbell, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFirebase } from "@/firebase";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc, collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const SceneBackground = dynamic(
  () => import("@/components/three/SceneBackground").then((mod) => mod.SceneBackground),
  { ssr: false }
);

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [scene, setScene] = useState(1);
  const totalScenes = 9;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSending, setIsSending] = useState(false);
  
  // Refs for touch navigation
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    if (scene < totalScenes) {
      setIsTransitioning(true);
      setScene(s => s + 1);
      setTimeout(() => setIsTransitioning(false), 1500);
    }
  }, [scene, isTransitioning]);

  const handlePrev = useCallback(() => {
    if (isTransitioning) return;
    if (scene > 1) {
      setIsTransitioning(true);
      setScene(s => s - 1);
      setTimeout(() => setIsTransitioning(false), 1500);
    }
  }, [scene, isTransitioning]);

  useEffect(() => {
    if (!mounted) return;

    let lastWheelTime = 0;
    
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime < 1000) return;

      if (e.deltaY > 30) {
        handleNext();
        lastWheelTime = now;
      } else if (e.deltaY < -30) {
        handlePrev();
        lastWheelTime = now;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        handleNext();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        handlePrev();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartRef.current === null) return;
      const touchEnd = e.changedTouches[0].clientY;
      const diff = touchStartRef.current - touchEnd;
      const threshold = 50;
      if (Math.abs(diff) > threshold) {
        if (diff > 0) handleNext();
        else handlePrev();
      }
      touchStartRef.current = null;
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleNext, handlePrev, mounted]);

  const handleSendTransmission = () => {
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        variant: "destructive",
        title: "Incomplete Data",
        description: "Please fill all required fields to initiate transmission.",
      });
      return;
    }

    setIsSending(true);
    const submissionId = doc(collection(firestore, "contactSubmissions")).id;
    
    setDocumentNonBlocking(
      doc(firestore, "contactSubmissions", submissionId),
      {
        id: submissionId,
        name: formData.name,
        email: formData.email,
        message: formData.message,
        status: "new",
        submissionDateTime: new Date().toISOString()
      },
      { merge: true }
    );

    setTimeout(() => {
      setIsSending(false);
      setFormData({ name: "", email: "", message: "" });
      toast({
        title: "Transmission Successful",
        description: "Your message has been encrypted and sent to the command center.",
      });
    }, 1000);
  };

  if (!mounted) return null;

  return (
    <main className="relative bg-black w-full h-screen overflow-hidden font-body select-none">
      <SceneBackground scene={scene} />
      
      {/* GLOBAL HUD ELEMENTS */}
      <div className="fixed top-6 left-6 md:top-10 md:left-10 z-50 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[8px] md:text-[10px] font-code text-accent uppercase tracking-[0.3em]">Mix Aura: Live</span>
        </div>
        <span className="text-[6px] md:text-[8px] font-code text-white/30 uppercase tracking-[0.2em]">System: Active_Pulse</span>
      </div>

      <div className="fixed top-6 right-6 md:top-10 md:right-10 z-50 flex flex-col items-end gap-1 text-[6px] md:text-[8px] font-code text-white/30 uppercase tracking-[0.2em] pointer-events-none">
        <span>LAT: 30.0444° N</span>
        <span>LON: 31.2357° E</span>
        <span className="text-accent/40 mt-1 hidden md:block">Status: Orbital_Sync</span>
      </div>

      <AnimatePresence mode="wait">
        {scene === 1 && (
          <motion.div 
            key="scene-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none p-4 md:p-10"
          >
            <div className="relative text-center w-full px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative"
              >
                <div className="absolute -inset-20 bg-accent/10 blur-[120px] rounded-full opacity-50" />
                <div className="absolute -inset-10 bg-primary/10 blur-[80px] rounded-full opacity-30 animate-pulse" />
                
                <motion.h1 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="text-6xl sm:text-9xl md:text-[14rem] font-black tracking-tighter text-white uppercase leading-[0.75] hero-title-3d"
                >
                  Mix <br /> 
                  <span className="text-accent glow-text text-gradient">Aura</span>
                </motion.h1>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="mt-8 md:mt-16 flex flex-col items-center gap-6"
              >
                <div className="h-0.5 w-12 md:w-24 bg-gradient-to-r from-transparent via-accent to-transparent" />
                <p className="text-[10px] md:text-[18px] font-code text-white font-medium uppercase tracking-[0.4em] md:tracking-[1em] text-center max-w-[200px] md:max-w-none opacity-80">
                  Architects of Digital Dominance
                </p>
                <div className="flex gap-4 md:gap-12 mt-4 md:mt-6">
                   <div className="flex flex-col items-center gap-2 group">
                      <div className="p-1.5 md:p-2 rounded-full bg-accent/5 border border-accent/20">
                        <Zap size={12} className="text-accent md:w-4 md:h-4" />
                      </div>
                      <span className="text-[7px] md:text-[9px] font-code uppercase tracking-widest text-white/40">Fast</span>
                   </div>
                   <div className="flex flex-col items-center gap-2 group">
                      <div className="p-1.5 md:p-2 rounded-full bg-accent/5 border border-accent/20">
                        <ShieldCheck size={12} className="text-accent md:w-4 md:h-4" />
                      </div>
                      <span className="text-[7px] md:text-[9px] font-code uppercase tracking-widest text-white/40">Secure</span>
                   </div>
                   <div className="flex flex-col items-center gap-2 group">
                      <div className="p-1.5 md:p-2 rounded-full bg-accent/5 border border-accent/20">
                        <Cpu size={12} className="text-accent md:w-4 md:h-4" />
                      </div>
                      <span className="text-[7px] md:text-[9px] font-code uppercase tracking-widest text-white/40">Smart</span>
                   </div>
                </div>
              </motion.div>
            </div>

            <motion.button
              onClick={handleNext}
              className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-2 text-white/30 hover:text-accent transition-all group"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-[6px] md:text-[8px] font-code uppercase tracking-[0.4em] group-hover:tracking-[0.6em] transition-all">Engage System</span>
              <ChevronDown size={18} className="md:w-6 md:h-6" />
            </motion.button>
          </motion.div>
        )}

        {[2, 4, 6, 8].map((s) => (
           scene === s && (
            <motion.div 
              key={`scene-${s}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="fixed inset-0 z-10 flex flex-col items-center md:items-start justify-center md:pl-[55%] pointer-events-none p-6"
            >
              <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
                {s >= 4 && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-[1px] bg-accent/40" />
                      <span className="text-[8px] md:text-[11px] font-code text-accent uppercase tracking-widest">Our Clients</span>
                   </motion.div>
                )}
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[4px] md:tracking-[12px] text-gradient uppercase glow-purple mb-2 leading-none"
                >
                  {s === 2 && "WEB DEVELOPMENT"}
                  {s === 4 && "GLOBAL REAL ESTATE"}
                  {s === 6 && "COMETA FURNITURE"}
                  {s === 8 && "SCRIPT SERVICES"}
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="max-w-[280px] md:max-w-md text-[8px] md:text-[11px] font-code text-white uppercase tracking-[0.2em] md:tracking-[0.5em] leading-relaxed"
                >
                  {s === 2 && "Architecting digital empires with precision code and futuristic aesthetics."}
                  {s === 4 && "Strategic Partnership: Revolutionizing property showcasing through advanced visual intelligence."}
                  {s === 6 && "Redefining interior elegance through architectural precision in digital commerce."}
                  {s === 8 && "Powering global enterprises with hyper-scalable automation and intelligent scripts."}
                </motion.p>
                <div className="h-0.5 md:h-1 w-16 md:w-40 bg-accent mt-4 md:mt-6 origin-center md:origin-left shadow-[0_0_20px_rgba(168,85,247,0.7)]" />
              </div>
            </motion.div>
          )
        ))}

        {[3, 5, 7].map((s) => (
           scene === s && (
            <motion.div 
              key={`scene-${s}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="fixed inset-0 z-10 flex flex-col items-center md:items-start justify-center md:pl-[12%] pointer-events-none p-6"
            >
              <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
                {s >= 4 && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-[1px] bg-accent/40" />
                      <span className="text-[8px] md:text-[11px] font-code text-accent uppercase tracking-widest">Our Clients</span>
                   </motion.div>
                )}
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[4px] md:tracking-[12px] text-gradient uppercase glow-purple mb-2 leading-none"
                >
                  {s === 3 && "DIGITAL MARKETING"}
                  {s === 5 && "JEWEL HOTEL"}
                  {s === 7 && "GARAGE GYM"}
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="max-w-[280px] md:max-w-md text-[8px] md:text-[11px] font-code text-white uppercase tracking-[0.2em] md:tracking-[0.5em] leading-relaxed"
                >
                  {s === 3 && "Engineering virality and market dominance through data-driven campaigns."}
                  {s === 5 && "Elevating luxury hospitality through cutting-edge digital experiences."}
                  {s === 7 && "Engineering elite fitness experiences through heavy-duty digital transformation."}
                </motion.p>
                <div className="h-0.5 md:h-1 w-16 md:w-40 bg-accent mt-4 md:mt-6 origin-center md:origin-left shadow-[0_0_20px_rgba(168,85,247,0.7)]" />
              </div>
            </motion.div>
          )
        ))}

        {scene === 9 && (
          <motion.div 
            key="scene-9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-auto overflow-y-auto p-4 md:p-10"
          >
            <div className="max-w-md w-full flex flex-col items-center gap-6 pointer-events-auto my-auto py-10">
              <div className="text-center">
                <motion.h2 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[4px] md:tracking-[12px] text-gradient uppercase glow-purple mb-2"
                >
                  COMMAND CENTER
                </motion.h2>
                <p className="text-[7px] md:text-[10px] font-code text-white/40 uppercase tracking-[0.3em] md:tracking-[0.5em]">Initiate Secure Communication</p>
              </div>

              <div className="w-full space-y-3 bg-black/40 backdrop-blur-3xl p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-accent/10 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
                <div className="grid grid-cols-1 gap-3">
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="AGENT NAME" 
                    className="bg-white/5 border-white/10 font-code text-[9px] h-10 rounded-xl focus:border-accent/50" 
                  />
                  <Input 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="SECURE EMAIL" 
                    className="bg-white/5 border-white/10 font-code text-[9px] h-10 rounded-xl focus:border-accent/50" 
                  />
                </div>
                <Textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="ENCRYPTED MESSAGE..." 
                  className="bg-white/5 border-white/10 font-code text-[9px] min-h-[80px] rounded-xl focus:border-accent/50" 
                />
                <Button 
                  onClick={handleSendTransmission}
                  disabled={isSending}
                  className="w-full bg-accent hover:bg-accent/80 text-black font-black tracking-[0.15em] h-10 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                >
                  {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="mr-2" />}
                  {isSending ? "ENCRYPTING..." : "SEND TRANSMISSION"}
                </Button>
              </div>

              <div className="flex gap-6 items-center justify-center">
                <motion.a whileHover={{ scale: 1.2 }} href="https://www.instagram.com/mixaura__" target="_blank" className="text-white/30"><Instagram size={18} /></motion.a>
                <motion.a whileHover={{ scale: 1.2 }} href="https://www.facebook.com/share/1DkvUeKDKD/" target="_blank" className="text-white/30"><Facebook size={18} /></motion.a>
                <motion.a whileHover={{ scale: 1.2 }} href="https://wa.me/201020117504" target="_blank" className="text-white/30"><MessageSquare size={18} /></motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
