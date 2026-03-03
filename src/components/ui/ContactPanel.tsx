
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
    <div className="max-w-4xl mx-auto w-full px-4 md:px-0">
      <div className="relative p-8 md:p-20 rounded-[5rem] md:rounded-[12rem] border border-white/10 bg-black/60 backdrop-blur-3xl shadow-2xl transition-all duration-700">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="space-y-6 md:space-y-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-2 md:space-y-4">
              <Label className="text-[9px] md:text-[11px] uppercase tracking-[0.4em] text-accent/50 font-code ml-6 md:ml-10">Brand Identity</Label>
              <Input
                onFocus={() => setIsFocused("name")}
                onBlur={() => setIsFocused(null)}
                placeholder="Company Name"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-14 md:h-18 rounded-full px-8 md:px-12 transition-all duration-500 text-sm md:text-base"
              />
            </div>
            <div className="space-y-2 md:space-y-4">
              <Label className="text-[9px] md:text-[11px] uppercase tracking-[0.4em] text-accent/50 font-code ml-6 md:ml-10">Direct Link</Label>
              <Input
                onFocus={() => setIsFocused("email")}
                onBlur={() => setIsFocused(null)}
                placeholder="Contact Email"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-14 md:h-18 rounded-full px-8 md:px-12 transition-all duration-500 text-sm md:text-base"
              />
            </div>
          </div>

          <div className="space-y-2 md:space-y-4">
            <Label className="text-[9px] md:text-[11px] uppercase tracking-[0.4em] text-accent/50 font-code ml-6 md:ml-10">Objective</Label>
            <Textarea
              onFocus={() => setIsFocused("message")}
              onBlur={() => setIsFocused(null)}
              placeholder="Brief your expansion objectives..."
              className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 min-h-[140px] md:min-h-[220px] rounded-[3rem] md:rounded-[6rem] p-8 md:p-12 transition-all duration-500 text-sm md:text-lg resize-none"
            />
          </div>

          <Button className="w-full bg-accent hover:bg-white text-black h-16 md:h-24 rounded-full text-base md:text-2xl font-black uppercase tracking-[0.2em] transition-all duration-700 hover:scale-[1.01] active:scale-95 shadow-[0_20px_40px_-12px_rgba(196,27,253,0.3)]">
            Establish Authority
          </Button>

          <div className="flex justify-between items-center pt-6 md:pt-12 border-t border-white/5">
            <div className="flex gap-3">
              <div className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full transition-all duration-700 ${isFocused ? 'bg-accent scale-150 shadow-[0_0_10px_#C41BFD]' : 'bg-white/10'}`} />
              <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-white/10" />
              <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-white/10" />
            </div>
            <p className="text-[8px] md:text-[10px] font-code text-white/20 uppercase tracking-[0.3em]">Encrypted Transmission Ready</p>
          </div>
        </motion.div>

        <div className="absolute inset-0 rounded-[5rem] md:rounded-[12rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
