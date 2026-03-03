
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const ContactPanel: React.FC = () => {
  const [isFocused, setIsFocused] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="relative p-8 md:p-16 rounded-[5rem] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="space-y-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.3em] text-accent/60 font-code ml-4">Identifier</Label>
              <Input
                onFocus={() => setIsFocused("name")}
                onBlur={() => setIsFocused(null)}
                placeholder="Name"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-14 rounded-full px-8 transition-all duration-500"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.3em] text-accent/60 font-code ml-4">Terminal</Label>
              <Input
                onFocus={() => setIsFocused("email")}
                onBlur={() => setIsFocused(null)}
                placeholder="Email"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-14 rounded-full px-8 transition-all duration-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-[0.3em] text-accent/60 font-code ml-4">Transmission</Label>
            <Textarea
              onFocus={() => setIsFocused("message")}
              onBlur={() => setIsFocused(null)}
              placeholder="Your vision..."
              className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 min-h-[150px] rounded-[2.5rem] p-8 transition-all duration-500"
            />
          </div>

          <Button className="w-full bg-accent hover:bg-white text-black h-16 rounded-full text-lg font-black uppercase tracking-widest transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_-12px_rgba(196,27,253,0.3)]">
            Initiate Connection
          </Button>

          <div className="flex justify-between items-center pt-6 border-t border-white/5">
            <div className="flex gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${isFocused ? 'bg-accent animate-pulse' : 'bg-white/10'}`} />
              <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            </div>
            <p className="text-[9px] font-code text-white/30 uppercase tracking-[0.2em]">System Status: Ready</p>
          </div>
        </motion.div>

        {/* Glossy Overlay */}
        <div className="absolute inset-0 rounded-[5rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
