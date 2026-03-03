
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
    <div className="max-w-6xl mx-auto w-full px-4 pb-20">
      <div className="relative p-12 md:p-24 rounded-[8rem] md:rounded-[12rem] border border-white/10 bg-black/70 backdrop-blur-3xl shadow-2xl transition-all duration-700">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="space-y-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <Label className="text-[11px] md:text-[13px] uppercase tracking-[0.6em] text-accent/50 font-code ml-12">Entity Identity</Label>
              <Input
                onFocus={() => setIsFocused("name")}
                onBlur={() => setIsFocused(null)}
                placeholder="Partner Name"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-20 md:h-28 rounded-full px-12 md:px-16 transition-all duration-500 text-sm md:text-2xl font-medium"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-[11px] md:text-[13px] uppercase tracking-[0.6em] text-accent/50 font-code ml-12">Neural Link</Label>
              <Input
                onFocus={() => setIsFocused("email")}
                onBlur={() => setIsFocused(null)}
                placeholder="Secure Email"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-20 md:h-28 rounded-full px-12 md:px-16 transition-all duration-500 text-sm md:text-2xl font-medium"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[11px] md:text-[13px] uppercase tracking-[0.6em] text-accent/50 font-code ml-12">Expansion Objective</Label>
            <Textarea
              onFocus={() => setIsFocused("message")}
              onBlur={() => setIsFocused(null)}
              placeholder="Detail your digital infiltration goals..."
              className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 min-h-[200px] md:min-h-[350px] rounded-[5rem] md:rounded-[8rem] p-12 md:p-20 transition-all duration-700 text-sm md:text-2xl resize-none font-medium leading-relaxed"
            />
          </div>

          <Button className="w-full bg-accent hover:bg-white text-black h-24 md:h-36 rounded-full text-xl md:text-4xl font-black uppercase tracking-[0.3em] transition-all duration-1000 hover:scale-[1.01] active:scale-95 shadow-[0_30px_60px_-15px_rgba(196,27,253,0.5)]">
            Establish Authority
          </Button>

          <div className="flex justify-between items-center pt-12 border-t border-white/5">
            <div className="flex gap-6">
              <div className={`w-3 md:w-4 h-3 md:h-4 rounded-full transition-all duration-1000 ${isFocused ? 'bg-accent scale-150 shadow-[0_0_20px_#C41BFD]' : 'bg-white/10'}`} />
              <div className="w-3 md:w-4 h-3 md:h-4 rounded-full bg-white/10" />
              <div className="w-3 md:w-4 h-3 md:h-4 rounded-full bg-white/10" />
            </div>
            <p className="text-[10px] md:text-[12px] font-code text-white/30 uppercase tracking-[0.6em]">Secure Transmission Port: Active</p>
          </div>
        </motion.div>

        <div className="absolute inset-0 rounded-[8rem] md:rounded-[12rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
