
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
    <div className="relative w-full max-w-md aspect-[4/5] min-h-[450px] p-6 md:p-10 rounded-[5rem] md:rounded-[7rem] border border-white/10 bg-black/70 backdrop-blur-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-700">
      <div className="mb-6 md:mb-8 text-center shrink-0">
        <h3 className="inline-flex items-center gap-2 text-lg md:text-2xl font-black tracking-tighter uppercase mb-1">
          <Sparkles className="w-4 h-4 text-accent" />
          STRATEGIST
        </h3>
        <p className="text-[7px] md:text-[8px] font-code text-accent/40 uppercase tracking-[0.4em]">
          Marketing Intelligence
        </p>
      </div>

      <div className="flex gap-2 mb-6 md:mb-8 shrink-0">
        <Input
          placeholder="Growth Keywords..."
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="bg-white/5 border-white/10 focus:border-accent/50 h-12 md:h-14 rounded-full px-6 text-[10px] md:text-xs placeholder:opacity-20"
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !keywords.trim()}
          className="bg-accent hover:bg-white text-black font-black h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-full transition-all active:scale-90"
        >
          {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "RUN"}
        </Button>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {suggestions.map((suggestion, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative p-5 md:p-6 rounded-[2.5rem] md:rounded-[3.5rem] bg-white/5 border border-white/5 hover:border-accent/30 transition-all"
            >
              <p className="text-[9px] md:text-[11px] leading-relaxed pr-8">{suggestion}</p>
              <button
                onClick={() => copyToClipboard(suggestion, idx)}
                className="absolute top-5 right-5 text-white/20 hover:text-accent"
              >
                {copiedIndex === idx ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {suggestions.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center opacity-5">
            <Sparkles className="w-10 h-10 mb-3" />
            <p className="text-[8px] uppercase tracking-[0.8em] font-code text-center">Standby</p>
          </div>
        )}
      </div>
    </div>
  );
};

