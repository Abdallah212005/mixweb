
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
    <div className="max-w-xl mx-auto w-full">
      <div className="relative p-1 rounded-2xl bg-gradient-to-br from-primary/30 via-accent/20 to-transparent">
        <div className="bg-[#100E11] rounded-[14px] p-8 md:p-12">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-accent/70 font-code">Identifier</Label>
                <Input
                  onFocus={() => setIsFocused("name")}
                  onBlur={() => setIsFocused(null)}
                  placeholder="Your Name"
                  className="bg-transparent border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary h-12 transition-all duration-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-accent/70 font-code">Terminal Access</Label>
                <Input
                  onFocus={() => setIsFocused("email")}
                  onBlur={() => setIsFocused(null)}
                  placeholder="your@email.com"
                  className="bg-transparent border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary h-12 transition-all duration-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-accent/70 font-code">Transmission Data</Label>
              <Textarea
                onFocus={() => setIsFocused("message")}
                onBlur={() => setIsFocused(null)}
                placeholder="Describe your vision..."
                className="bg-transparent border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary min-h-[150px] transition-all duration-500"
              />
            </div>

            <Button className="w-full bg-primary hover:bg-primary/80 h-14 text-lg font-bold group relative overflow-hidden transition-all duration-500">
              <span className="relative z-10">INITIATE CONNECTION</span>
              <motion.div
                className="absolute inset-0 bg-accent/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.8 }}
              />
              <div className="absolute inset-0 bg-primary shadow-[0_0_30px_rgba(196,27,253,0.5)] group-active:scale-95 transition-transform" />
            </Button>

            <div className="flex justify-between items-center pt-4 border-t border-primary/10">
              <div className="flex gap-4">
                <div className={`w-1 h-1 rounded-full ${isFocused ? 'bg-primary animate-ping' : 'bg-primary/30'}`} />
                <div className="w-1 h-1 rounded-full bg-primary/30" />
                <div className="w-1 h-1 rounded-full bg-primary/30" />
              </div>
              <p className="text-[10px] font-code text-muted-foreground uppercase">System: Awaiting Input</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
