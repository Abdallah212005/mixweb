
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
      <div className="relative p-8 md:p-12 lg:p-16 rounded-[6rem] md:rounded-[8rem] lg:rounded-[10rem] border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl transition-all duration-700">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="space-y-6 md:space-y-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-2">
              <Label className="text-[9px] uppercase tracking-[0.4em] text-accent/50 font-code ml-8">Partner Name</Label>
              <Input
                onFocus={() => setIsFocused("name")}
                onBlur={() => setIsFocused(null)}
                placeholder="Identity"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-14 md:h-18 lg:h-20 rounded-full px-10 transition-all text-sm md:text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] uppercase tracking-[0.4em] text-accent/50 font-code ml-8">Secure Email</Label>
              <Input
                onFocus={() => setIsFocused("email")}
                onBlur={() => setIsFocused(null)}
                placeholder="Link"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-14 md:h-18 lg:h-20 rounded-full px-10 transition-all text-sm md:text-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[9px] uppercase tracking-[0.4em] text-accent/50 font-code ml-8">Growth Objective</Label>
            <Textarea
              onFocus={() => setIsFocused("message")}
              onBlur={() => setIsFocused(null)}
              placeholder="Detail infiltration goals..."
              className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 min-h-[120px] md:min-h-[160px] lg:min-h-[180px] rounded-[3rem] md:rounded-[5rem] p-8 md:p-10 lg:p-12 transition-all text-sm md:text-lg resize-none"
            />
          </div>

          <Button className="w-full bg-accent hover:bg-white text-black h-16 md:h-20 lg:h-24 rounded-full text-lg md:text-xl lg:text-2xl font-black uppercase tracking-[0.3em] transition-all duration-700 active:scale-95 shadow-lg">
            Establish Authority
          </Button>

          <div className="flex justify-between items-center pt-6 border-t border-white/5">
            <div className="flex gap-4">
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isFocused ? 'bg-accent shadow-[0_0_10px_#C41BFD]' : 'bg-white/10'}`} />
              <div className="w-2 h-2 rounded-full bg-white/10" />
            </div>
            <p className="text-[8px] font-code text-white/20 uppercase tracking-[0.5em]">Port: Active</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
