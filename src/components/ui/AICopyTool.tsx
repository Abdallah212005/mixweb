
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
    <div className="relative w-full max-w-xl p-10 md:p-16 rounded-[6rem] md:rounded-[10rem] border border-white/10 bg-black/70 backdrop-blur-3xl shadow-2xl overflow-hidden min-h-[600px] md:min-h-[850px] flex flex-col transition-all duration-700">
      <div className="mb-10 md:mb-14 text-center">
        <h3 className="inline-flex items-center gap-6 text-3xl md:text-6xl font-black tracking-tighter uppercase mb-4">
          <Sparkles className="w-8 md:w-12 h-8 md:h-12 text-accent" />
          STRATEGIST
        </h3>
        <p className="text-[10px] font-code text-accent/50 uppercase tracking-[0.6em]">
          Urban Influence Intelligence
        </p>
      </div>

      <div className="flex gap-4 mb-10 md:mb-16">
        <Input
          placeholder="Keyword resonance..."
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="bg-white/5 border-white/10 focus:border-accent/50 h-16 md:h-24 rounded-full px-10 md:px-14 transition-all duration-500 text-sm md:text-xl placeholder:opacity-20"
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !keywords.trim()}
          className="bg-accent hover:bg-white text-black font-black h-16 md:h-24 w-16 md:w-24 shrink-0 rounded-full shadow-2xl transition-all active:scale-90"
        >
          {isLoading ? <Loader2 className="animate-spin w-8 h-8" /> : "RUN"}
        </Button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {suggestions.map((suggestion, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
              className="group relative p-10 md:p-14 rounded-[4rem] md:rounded-[6rem] bg-white/5 border border-white/5 hover:border-accent/30 transition-all duration-700"
            >
              <p className="text-sm md:text-2xl leading-relaxed pr-12 font-medium">{suggestion}</p>
              <button
                onClick={() => copyToClipboard(suggestion, idx)}
                className="absolute top-10 md:top-14 right-10 md:right-14 text-white/30 hover:text-accent transition-colors"
              >
                {copiedIndex === idx ? <Check className="w-6 h-6 text-green-400" /> : <Copy className="w-6 h-6" />}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {suggestions.length === 0 && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-10">
            <Sparkles className="w-20 md:w-32 h-20 md:h-32 mb-10" />
            <p className="text-[12px] md:text-[14px] uppercase tracking-[1em] font-code">Network Standby</p>
          </div>
        )}
      </div>

      <div className="absolute -bottom-40 -right-40 w-96 md:w-[32rem] h-96 md:h-[32rem] bg-accent/10 blur-[200px] rounded-full pointer-events-none" />
    </div>
  );
};
