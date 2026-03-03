
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
    <div className="relative w-full max-w-lg p-10 md:p-14 rounded-[5rem] md:rounded-[8rem] border border-white/10 bg-black/60 backdrop-blur-3xl shadow-2xl overflow-hidden min-h-[550px] md:min-h-[750px] flex flex-col transition-all duration-700">
      <div className="mb-8 md:mb-10 text-center">
        <h3 className="inline-flex items-center gap-4 text-3xl md:text-5xl font-black tracking-tighter uppercase mb-2">
          <Sparkles className="w-6 md:w-10 h-6 md:h-10 text-accent animate-pulse" />
          Strategist
        </h3>
        <p className="text-[10px] font-code text-accent/50 uppercase tracking-[0.5em]">
          Urban Intelligence Link
        </p>
      </div>

      <div className="flex gap-3 mb-8 md:mb-12">
        <Input
          placeholder="Market trends..."
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="bg-white/5 border-white/10 focus:border-accent/50 h-14 md:h-20 rounded-full px-8 md:px-10 transition-all duration-500 text-sm md:text-base placeholder:opacity-30"
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !keywords.trim()}
          className="bg-accent hover:bg-white text-black font-black h-14 md:h-20 w-14 md:w-20 shrink-0 rounded-full shadow-2xl transition-all active:scale-90"
        >
          {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : "GO"}
        </Button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {suggestions.map((suggestion, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
              className="group relative p-8 md:p-10 rounded-[3rem] md:rounded-[4rem] bg-white/5 border border-white/5 hover:border-accent/30 transition-all duration-500"
            >
              <p className="text-xs md:text-lg leading-relaxed pr-8 font-medium">{suggestion}</p>
              <button
                onClick={() => copyToClipboard(suggestion, idx)}
                className="absolute top-8 md:top-10 right-8 md:right-10 text-white/30 hover:text-accent transition-colors"
              >
                {copiedIndex === idx ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {suggestions.length === 0 && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-10">
            <Sparkles className="w-16 md:w-24 h-16 md:h-24 mb-8" />
            <p className="text-[10px] md:text-[12px] uppercase tracking-[0.6em] font-code">Network Standby</p>
          </div>
        )}
      </div>

      <div className="absolute -bottom-20 -right-20 w-64 md:w-96 h-64 md:h-96 bg-accent/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none" />
    </div>
  );
};
