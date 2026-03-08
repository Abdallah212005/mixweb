
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Instagram, Facebook, MessageSquare, Send, Zap, ShieldCheck, Cpu, Loader2 } from "lucide-react";
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
      if (e.deltaY > 30) { handleNext(); lastWheelTime = now; }
      else if (e.deltaY < -30) { handlePrev(); lastWheelTime = now; }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") handleNext();
      else if (e.key === "ArrowUp" || e.key === "PageUp") handlePrev();
    };

    const handleTouchStart = (e: TouchEvent) => { touchStartRef.current = e.touches[0].clientY; };
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartRef.current === null) return;
      const touchEnd = e.changedTouches[0].clientY;
      const diff = touchStartRef.current - touchEnd;
      if (Math.abs(diff) > 50) { if (diff > 0) handleNext(); else handlePrev(); }
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
      toast({ variant: "destructive", title: "Incomplete Data", description: "Please fill all required fields." });
      return;
    }
    setIsSending(true);
    const id = doc(collection(firestore, "contactSubmissions")).id;
    setDocumentNonBlocking(doc(firestore, "contactSubmissions", id), {
      id, ...formData, status: "new", submissionDateTime: new Date().toISOString()
    }, { merge: true });
    setTimeout(() => {
      setIsSending(false);
      setFormData({ name: "", email: "", message: "" });
      toast({ title: "Transmission Successful", description: "Message sent to the command center." });
    }, 1000);
  };

  if (!mounted) return null;

  return (
    <main className="relative bg-black w-full h-screen overflow-hidden font-body select-none">
      <SceneBackground scene={scene} />
      
      {/* GLOBAL HUD ELEMENTS */}
      <div className="fixed top-4 left-4 md:top-10 md:left-10 z-50 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[7px] md:text-[10px] font-code text-accent uppercase tracking-[0.3em]">Mix Aura: Live</span>
        </div>
      </div>

      <div className="fixed top-4 right-4 md:top-10 md:right-10 z-50 flex flex-col items-end gap-1 text-[6px] md:text-[8px] font-code text-white/30 uppercase tracking-[0.2em] pointer-events-none">
        <span>LAT: 30.0444° N</span>
        <span>LON: 31.2357° E</span>
      </div>

      <AnimatePresence mode="wait">
        {scene === 1 && (
          <motion.div key="scene-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none p-4">
            <div className="text-center">
              <motion.h1 initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-5xl sm:text-8xl md:text-[12rem] font-black tracking-tighter text-white uppercase leading-[0.8] hero-title-3d">
                Mix <br /> <span className="text-accent glow-text text-gradient">Aura</span>
              </motion.h1>
              <p className="mt-6 text-[8px] md:text-[14px] font-code text-white/60 uppercase tracking-[0.5em] md:tracking-[1em]">Architects of Digital Dominance</p>
            </div>
            <motion.button onClick={handleNext} className="absolute bottom-10 pointer-events-auto text-white/30 hover:text-accent transition-all flex flex-col items-center gap-2" animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <span className="text-[7px] font-code uppercase tracking-widest">Engage</span>
              <ChevronDown size={20} />
            </motion.button>
          </motion.div>
        )}

        {[2, 4, 6, 8].map((s) => scene === s && (
          <motion.div key={`scene-${s}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-10 flex flex-col items-center md:items-start justify-center md:pl-[55%] pointer-events-none p-6">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[8px] md:text-[11px] font-code text-accent uppercase tracking-widest mb-1">Our Clients</span>
              <h2 className="text-3xl md:text-6xl font-black text-gradient uppercase glow-purple mb-4 leading-none">
                {s === 2 && "WEB DEVELOPMENT"}
                {s === 4 && "GLOBAL REAL ESTATE"}
                {s === 6 && "COMETA FURNITURE"}
                {s === 8 && "SCRIPT SERVICES"}
              </h2>
              <p className="max-w-[280px] md:max-w-md text-[8px] md:text-[11px] font-code text-white/60 uppercase tracking-widest leading-relaxed">
                {s === 2 && "Architecting digital empires with precision code."}
                {s === 4 && "Revolutionizing property showcasing through advanced visual intelligence."}
                {s === 6 && "Redefining interior elegance through architectural precision."}
                {s === 8 && "Powering global enterprises with hyper-scalable automation."}
              </p>
            </div>
          </motion.div>
        ))}

        {[3, 5, 7].map((s) => scene === s && (
          <motion.div key={`scene-${s}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-10 flex flex-col items-center md:items-start justify-center md:pl-[12%] pointer-events-none p-6">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[8px] md:text-[11px] font-code text-accent uppercase tracking-widest mb-1">Our Clients</span>
              <h2 className="text-3xl md:text-6xl font-black text-gradient uppercase glow-purple mb-4 leading-none">
                {s === 3 && "DIGITAL MARKETING"}
                {s === 5 && "JEWEL HOTEL"}
                {s === 7 && "GARAGE GYM"}
              </h2>
              <p className="max-w-[280px] md:max-w-md text-[8px] md:text-[11px] font-code text-white/60 uppercase tracking-widest leading-relaxed">
                {s === 3 && "Engineering virality and market dominance through data-driven campaigns."}
                {s === 5 && "Elevating luxury hospitality through cutting-edge digital experiences."}
                {s === 7 && "Engineering elite fitness experiences through digital transformation."}
              </p>
            </div>
          </motion.div>
        ))}

        {scene === 9 && (
          <motion.div key="scene-9" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-10 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-black/40 backdrop-blur-3xl p-6 md:p-10 rounded-[2rem] border border-accent/10 shadow-2xl">
              <h2 className="text-2xl md:text-4xl font-black text-gradient text-center uppercase mb-6">COMMAND CENTER</h2>
              <div className="space-y-4">
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="AGENT NAME" className="bg-white/5 border-white/10 font-code text-[10px]" />
                <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="SECURE EMAIL" className="bg-white/5 border-white/10 font-code text-[10px]" />
                <Textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="ENCRYPTED MESSAGE..." className="bg-white/5 border-white/10 font-code text-[10px]" />
                <Button onClick={handleSendTransmission} disabled={isSending} className="w-full bg-accent text-black font-black py-6">
                  {isSending ? <Loader2 className="animate-spin" /> : <Send size={16} className="mr-2" />}
                  SEND TRANSMISSION
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
