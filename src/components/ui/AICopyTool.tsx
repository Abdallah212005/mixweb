
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
    <div className="relative w-full max-w-lg mx-auto p-8 md:p-14 rounded-[5rem] md:rounded-[10rem] border border-white/10 bg-black/60 backdrop-blur-3xl shadow-2xl overflow-hidden min-h-[500px] md:min-h-[750px] flex flex-col transition-all duration-700">
      <div className="mb-6 md:mb-10 text-center">
        <h3 className="inline-flex items-center gap-3 md:gap-4 text-2xl md:text-4xl font-black tracking-tighter uppercase mb-2">
          <Sparkles className="w-5 md:w-8 h-5 md:h-8 text-accent animate-pulse" />
          Strategist
        </h3>
        <p className="text-[9px] font-code text-accent/50 uppercase tracking-[0.4em]">
          Urban Intelligence Link
        </p>
      </div>

      <div className="flex gap-2 md:gap-3 mb-6 md:mb-10">
        <Input
          placeholder="Market trends..."
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="bg-white/5 border-white/10 focus:border-accent/50 h-12 md:h-16 rounded-full px-5 md:px-8 transition-all duration-500 text-sm md:text-base"
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !keywords.trim()}
          className="bg-accent hover:bg-white text-black font-black h-12 md:h-16 w-12 md:w-16 shrink-0 rounded-full shadow-2xl transition-all active:scale-90"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "GO"}
        </Button>
      </div>

      <div className="space-y-4 md:space-y-6 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {suggestions.map((suggestion, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
              className="group relative p-5 md:p-8 rounded-[3rem] md:rounded-[4rem] bg-white/5 border border-white/5 hover:border-accent/30 transition-all duration-500"
            >
              <p className="text-xs md:text-base leading-relaxed pr-8 font-medium">{suggestion}</p>
              <button
                onClick={() => copyToClipboard(suggestion, idx)}
                className="absolute top-5 md:top-8 right-5 md:right-8 text-white/30 hover:text-accent transition-colors"
              >
                {copiedIndex === idx ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {suggestions.length === 0 && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center opacity-10">
            <Sparkles className="w-12 md:w-20 h-12 md:h-20 mb-6" />
            <p className="text-[9px] md:text-[11px] uppercase tracking-[0.5em] font-code">Network Standby</p>
          </div>
        )}
      </div>

      <div className="absolute -bottom-20 -right-20 w-48 md:w-80 h-48 md:h-80 bg-accent/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
};
