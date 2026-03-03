
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateMarketingCopy } from "@/ai/flows/ai-copy-resonance-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="bg-card/30 border-primary/20 backdrop-blur-xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-primary/10">
        <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Copy Resonance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Engineer bespoke marketing influence based on conceptual keywords.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="e.g. Dominance, Future, Neural, Flow"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="bg-background/50 border-primary/20 focus:border-primary/50"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !keywords.trim()}
            className="bg-primary hover:bg-primary/80 text-white font-bold px-6 shadow-[0_0_15px_rgba(196,27,253,0.3)]"
          >
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Sync"}
          </Button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {suggestions.map((suggestion, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative p-4 rounded-lg bg-background/40 border border-primary/10 hover:border-primary/30 transition-all cursor-default"
              >
                <p className="text-sm leading-relaxed pr-8">{suggestion}</p>
                <button
                  onClick={() => copyToClipboard(suggestion, idx)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
                >
                  {copiedIndex === idx ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {suggestions.length === 0 && !isLoading && (
            <div className="py-12 text-center">
              <div className="inline-block p-4 rounded-full bg-primary/5 border border-primary/10 mb-4">
                <Sparkles className="w-8 h-8 text-primary/40" />
              </div>
              <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                Enter conceptual keywords to reveal digital resonance.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
