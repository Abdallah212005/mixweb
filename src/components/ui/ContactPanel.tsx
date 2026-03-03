
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
    <div className="max-w-6xl mx-auto w-full pb-10">
      <div className="relative p-10 md:p-20 rounded-[8rem] md:rounded-[12rem] border border-white/10 bg-black/80 backdrop-blur-3xl shadow-2xl transition-all duration-700">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="space-y-8 md:space-y-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-3">
              <Label className="text-[10px] md:text-[12px] uppercase tracking-[0.6em] text-accent/50 font-code ml-8 md:ml-12">Entity Identity</Label>
              <Input
                onFocus={() => setIsFocused("name")}
                onBlur={() => setIsFocused(null)}
                placeholder="Partner Name"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-16 md:h-24 rounded-full px-10 md:px-12 transition-all duration-500 text-sm md:text-xl font-medium"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] md:text-[12px] uppercase tracking-[0.6em] text-accent/50 font-code ml-8 md:ml-12">Neural Link</Label>
              <Input
                onFocus={() => setIsFocused("email")}
                onBlur={() => setIsFocused(null)}
                placeholder="Secure Email"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-16 md:h-24 rounded-full px-10 md:px-12 transition-all duration-500 text-sm md:text-xl font-medium"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] md:text-[12px] uppercase tracking-[0.6em] text-accent/50 font-code ml-8 md:ml-12">Expansion Objective</Label>
            <Textarea
              onFocus={() => setIsFocused("message")}
              onBlur={() => setIsFocused(null)}
              placeholder="Detail your digital infiltration goals..."
              className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 min-h-[150px] md:min-h-[250px] rounded-[4rem] md:rounded-[6rem] p-10 md:p-14 transition-all duration-700 text-sm md:text-xl resize-none font-medium leading-relaxed"
            />
          </div>

          <Button className="w-full bg-accent hover:bg-white text-black h-20 md:h-32 rounded-full text-lg md:text-3xl font-black uppercase tracking-[0.3em] transition-all duration-700 hover:scale-[1.01] active:scale-95 shadow-[0_20px_50px_-10px_rgba(196,27,253,0.5)]">
            Establish Authority
          </Button>

          <div className="flex justify-between items-center pt-8 border-t border-white/5">
            <div className="flex gap-4 md:gap-6">
              <div className={`w-3 h-3 rounded-full transition-all duration-1000 ${isFocused ? 'bg-accent scale-150 shadow-[0_0_15px_#C41BFD]' : 'bg-white/10'}`} />
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
            </div>
            <p className="text-[9px] md:text-[11px] font-code text-white/30 uppercase tracking-[0.6em]">Secure Transmission Port: Active</p>
          </div>
        </motion.div>

        <div className="absolute inset-0 rounded-[8rem] md:rounded-[12rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
