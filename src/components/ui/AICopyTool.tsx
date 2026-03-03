
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateMarketingCopy } from "@/ai/flows/ai-copy-resonance-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";

export const AICopyTool: React.FC = () => {
  const [keywords, setKeywords] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!keywords.trim()) return;
    setIsLoading(true);
    try {
      const keywordArray = keywords.split(",").map((k) => k.trim()).filter(Boolean);
      const result = await generateMarketingCopy({ keywords: keywordArray });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("Error generating copy:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="relative w-full max-w-lg aspect-[4/5] min-h-[550px] p-8 md:p-14 rounded-[8rem] md:rounded-[10rem] border border-white/10 bg-black/60 backdrop-blur-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-700">
      <div className="mb-10 text-center shrink-0">
        <h3 className="inline-flex items-center gap-3 text-2xl md:text-4xl font-black tracking-tighter uppercase mb-2">
          <Sparkles className="w-5 md:w-7 h-5 md:h-7 text-accent" />
          STRATEGIST
        </h3>
        <p className="text-[9px] md:text-[10px] font-code text-accent/50 uppercase tracking-[0.6em]">
          Marketing Intelligence
        </p>
      </div>

      <div className="flex gap-3 mb-10 shrink-0">
        <Input
          placeholder="Growth Keywords..."
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="bg-white/5 border-white/10 focus:border-accent/50 h-16 md:h-20 rounded-full px-8 text-sm md:text-base placeholder:opacity-20"
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !keywords.trim()}
          className="bg-accent hover:bg-white text-black font-black h-16 md:h-20 w-16 md:w-20 shrink-0 rounded-full transition-all active:scale-90"
        >
          {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : "RUN"}
        </Button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {suggestions.map((suggestion, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative p-8 md:p-10 rounded-[4rem] md:rounded-[5rem] bg-white/5 border border-white/5 hover:border-accent/30 transition-all"
            >
              <p className="text-xs md:text-sm leading-relaxed pr-10">{suggestion}</p>
              <button
                onClick={() => copyToClipboard(suggestion, idx)}
                className="absolute top-8 right-8 text-white/30 hover:text-accent"
              >
                {copiedIndex === idx ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {suggestions.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center opacity-5">
            <Sparkles className="w-16 h-16 mb-6" />
            <p className="text-[10px] uppercase tracking-[1.2em] font-code text-center">Network Standby</p>
          </div>
        )}
      </div>
    </div>
  );
};
