
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
      <div className="relative p-12 md:p-20 rounded-[10rem] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl transition-all duration-700">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="space-y-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <Label className="text-[11px] uppercase tracking-[0.4em] text-accent/50 font-code ml-8">Identifier</Label>
              <Input
                onFocus={() => setIsFocused("name")}
                onBlur={() => setIsFocused(null)}
                placeholder="Name"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-16 rounded-full px-10 transition-all duration-500"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-[11px] uppercase tracking-[0.4em] text-accent/50 font-code ml-8">Terminal</Label>
              <Input
                onFocus={() => setIsFocused("email")}
                onBlur={() => setIsFocused(null)}
                placeholder="Email"
                className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 h-16 rounded-full px-10 transition-all duration-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[11px] uppercase tracking-[0.4em] text-accent/50 font-code ml-8">Transmission</Label>
            <Textarea
              onFocus={() => setIsFocused("message")}
              onBlur={() => setIsFocused(null)}
              placeholder="Your vision..."
              className="bg-white/5 border-white/10 focus:border-accent focus:ring-0 min-h-[180px] rounded-[5rem] p-10 transition-all duration-500 text-lg"
            />
          </div>

          <Button className="w-full bg-accent hover:bg-white text-black h-20 rounded-full text-xl font-black uppercase tracking-[0.2em] transition-all duration-700 hover:scale-[1.02] active:scale-95 shadow-[0_25px_50px_-12px_rgba(196,27,253,0.4)]">
            Initiate Connection
          </Button>

          <div className="flex justify-between items-center pt-10 border-t border-white/5">
            <div className="flex gap-4">
              <div className={`w-2 h-2 rounded-full transition-all duration-700 ${isFocused ? 'bg-accent scale-150' : 'bg-white/10'}`} />
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
            </div>
            <p className="text-[10px] font-code text-white/20 uppercase tracking-[0.3em]">Status: Transmission Ready</p>
          </div>
        </motion.div>

        <div className="absolute inset-0 rounded-[10rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
