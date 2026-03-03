
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
    <div className="relative p-8 md:p-12 rounded-[4rem] border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
      <div className="mb-8">
        <h3 className="flex items-center gap-3 text-3xl font-bold tracking-tighter uppercase mb-2">
          <Sparkles className="w-6 h-6 text-accent" />
          Intelligence
        </h3>
        <p className="text-xs font-code text-accent/60 uppercase tracking-widest">
          Sync conceptual resonance
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        <Input
          placeholder="Keywords..."
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="bg-white/5 border-white/10 focus:border-accent/50 h-12 rounded-full px-6"
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !keywords.trim()}
          className="bg-accent hover:bg-accent/80 text-black font-bold h-12 w-12 rounded-full shadow-lg"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "GO"}
        </Button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {suggestions.map((suggestion, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-accent/30 transition-all"
            >
              <p className="text-sm leading-relaxed pr-10 font-medium">{suggestion}</p>
              <button
                onClick={() => copyToClipboard(suggestion, idx)}
                className="absolute top-6 right-6 text-white/40 hover:text-accent transition-colors"
              >
                {copiedIndex === idx ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {suggestions.length === 0 && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center opacity-20">
            <Sparkles className="w-12 h-12 mb-4" />
            <p className="text-xs uppercase tracking-[0.3em] font-code">Awaiting synchronization</p>
          </div>
        )}
      </div>

      {/* Decorative Gradient */}
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/5 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
};
