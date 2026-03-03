
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
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative p-10 md:p-16 lg:p-20 rounded-[8rem] md:rounded-[12rem] lg:rounded-[14rem] border border-white/10 bg-black/60 backdrop-blur-3xl shadow-2xl transition-all duration-700">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="space-y-8 md:space-y-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.5em] text-accent/50 font-code ml-10">Partner Name</Label>
              <Input
                onFocus={() => setIsFocused("name")}
                onBlur={() => setIsFocused(null)}
                placeholder="Identity"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-16 md:h-22 rounded-full px-12 transition-all text-sm md:text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.5em] text-accent/50 font-code ml-10">Secure Email</Label>
              <Input
                onFocus={() => setIsFocused("email")}
                onBlur={() => setIsFocused(null)}
                placeholder="Link"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-16 md:h-22 rounded-full px-12 transition-all text-sm md:text-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-[0.5em] text-accent/50 font-code ml-10">Growth Objective</Label>
            <Textarea
              onFocus={() => setIsFocused("message")}
              onBlur={() => setIsFocused(null)}
              placeholder="Detail global infiltration goals..."
              className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 min-h-[140px] md:min-h-[200px] rounded-[4rem] md:rounded-[7rem] p-10 md:p-14 transition-all text-sm md:text-lg resize-none"
            />
          </div>

          <Button className="w-full bg-accent hover:bg-white text-black h-18 md:h-24 rounded-full text-lg md:text-2xl font-black uppercase tracking-[0.4em] transition-all duration-700 active:scale-95 shadow-xl">
            Establish Authority
          </Button>

          <div className="flex justify-between items-center pt-8 border-t border-white/10">
            <div className="flex gap-6">
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isFocused ? 'bg-accent shadow-[0_0_15px_#C41BFD]' : 'bg-white/10'}`} />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            </div>
            <p className="text-[9px] font-code text-white/30 uppercase tracking-[0.6em]">Secure Protocol: Active</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
