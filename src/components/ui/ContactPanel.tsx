
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
    <div className="max-w-3xl mx-auto w-full px-6 md:px-0">
      <div className="relative p-10 md:p-20 rounded-[6rem] md:rounded-[10rem] border border-white/10 bg-black/50 backdrop-blur-3xl shadow-2xl transition-all duration-700">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="space-y-8 md:space-y-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            <div className="space-y-3 md:space-y-4">
              <Label className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-accent/50 font-code ml-6 md:ml-8">Brand</Label>
              <Input
                onFocus={() => setIsFocused("name")}
                onBlur={() => setIsFocused(null)}
                placeholder="Company Name"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-14 md:h-16 rounded-full px-8 md:px-10 transition-all duration-500"
              />
            </div>
            <div className="space-y-3 md:space-y-4">
              <Label className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-accent/50 font-code ml-6 md:ml-8">Terminal</Label>
              <Input
                onFocus={() => setIsFocused("email")}
                onBlur={() => setIsFocused(null)}
                placeholder="Contact Email"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-14 md:h-16 rounded-full px-8 md:px-10 transition-all duration-500"
              />
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            <Label className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-accent/50 font-code ml-6 md:ml-8">Ambition</Label>
            <Textarea
              onFocus={() => setIsFocused("message")}
              onBlur={() => setIsFocused(null)}
              placeholder="Your vision for dominance..."
              className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 min-h-[150px] md:min-h-[180px] rounded-[3rem] md:rounded-[5rem] p-8 md:p-10 transition-all duration-500 text-base md:text-lg"
            />
          </div>

          <Button className="w-full bg-accent hover:bg-white text-black h-16 md:h-20 rounded-full text-lg md:text-xl font-black uppercase tracking-[0.2em] transition-all duration-700 hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_-12px_rgba(196,27,253,0.3)]">
            Initiate Expansion
          </Button>

          <div className="flex justify-between items-center pt-8 md:pt-10 border-t border-white/5">
            <div className="flex gap-4">
              <div className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full transition-all duration-700 ${isFocused ? 'bg-accent scale-150' : 'bg-white/10'}`} />
              <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-white/10" />
              <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-white/10" />
            </div>
            <p className="text-[9px] md:text-[10px] font-code text-white/20 uppercase tracking-[0.3em]">Ready for Transmission</p>
          </div>
        </motion.div>

        <div className="absolute inset-0 rounded-[6rem] md:rounded-[10rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
