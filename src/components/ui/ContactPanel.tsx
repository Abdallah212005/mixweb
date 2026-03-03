
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
    <div className="max-w-4xl mx-auto w-full px-4">
      <div className="relative p-10 md:p-16 rounded-[6rem] md:rounded-[10rem] border border-white/10 bg-black/60 backdrop-blur-3xl shadow-2xl transition-all duration-700">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="space-y-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] md:text-[12px] uppercase tracking-[0.5em] text-accent/50 font-code ml-8">Brand Identity</Label>
              <Input
                onFocus={() => setIsFocused("name")}
                onBlur={() => setIsFocused(null)}
                placeholder="Company Name"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-16 md:h-20 rounded-full px-10 transition-all duration-500 text-sm md:text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] md:text-[12px] uppercase tracking-[0.5em] text-accent/50 font-code ml-8">Direct Link</Label>
              <Input
                onFocus={() => setIsFocused("email")}
                onBlur={() => setIsFocused(null)}
                placeholder="Contact Email"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-16 md:h-20 rounded-full px-10 transition-all duration-500 text-sm md:text-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] md:text-[12px] uppercase tracking-[0.5em] text-accent/50 font-code ml-8">Objective</Label>
            <Textarea
              onFocus={() => setIsFocused("message")}
              onBlur={() => setIsFocused(null)}
              placeholder="Brief your expansion objectives..."
              className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 min-h-[160px] md:min-h-[220px] rounded-[3rem] md:rounded-[6rem] p-10 md:p-12 transition-all duration-500 text-sm md:text-xl resize-none"
            />
          </div>

          <Button className="w-full bg-accent hover:bg-white text-black h-20 md:h-28 rounded-full text-lg md:text-2xl font-black uppercase tracking-[0.2em] transition-all duration-700 hover:scale-[1.01] active:scale-95 shadow-[0_25px_50px_-15px_rgba(196,27,253,0.4)]">
            Establish Authority
          </Button>

          <div className="flex justify-between items-center pt-8 border-t border-white/5">
            <div className="flex gap-4">
              <div className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-all duration-700 ${isFocused ? 'bg-accent scale-150 shadow-[0_0_15px_#C41BFD]' : 'bg-white/10'}`} />
              <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-white/10" />
              <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-white/10" />
            </div>
            <p className="text-[9px] md:text-[11px] font-code text-white/20 uppercase tracking-[0.4em]">Encrypted Transmission Ready</p>
          </div>
        </motion.div>

        <div className="absolute inset-0 rounded-[6rem] md:rounded-[10rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
