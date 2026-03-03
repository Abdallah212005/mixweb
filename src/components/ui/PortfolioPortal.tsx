
"use client";

import React from "react";
import { motion } from "framer-motion";

interface Project {
  title: string;
  category: string;
  image: string;
}

export const PortfolioPortal: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  // Simple logic to keep the title clean for the 3D look
  const words = project.title.split(" ");
  const displayTitle = words.length > 1 ? `${words[0]} ${words[1]}` : project.title;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ 
        y: -15, 
        scale: 1.04, 
        borderColor: "rgba(196, 27, 253, 0.6)",
        boxShadow: "0 0 50px rgba(196, 27, 253, 0.3)" 
      }}
      className="relative group cursor-pointer aspect-[3/4] w-full overflow-hidden rounded-[3.5rem] border border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-150 shadow-2xl flex flex-col"
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover opacity-20 group-hover:opacity-90 grayscale group-hover:grayscale-0 scale-110 group-hover:scale-100 transition-all duration-300 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-200" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 h-full w-full p-8 flex flex-col justify-end">
        <div className="mb-4 transform group-hover:translate-y-[-5px] transition-transform duration-200">
          <p className="text-[8px] font-code text-accent/50 group-hover:text-accent uppercase tracking-[0.6em] mb-3 transition-colors duration-150">
            {project.category}
          </p>
          <h3 className="text-2xl font-black leading-tight tracking-tighter text-white uppercase group-hover:text-white glow-purple transition-all duration-150">
            {displayTitle}
          </h3>
        </div>
        
        {/* Animated Accent Line */}
        <div className="h-1 w-0 group-hover:w-20 bg-accent transition-all duration-300 rounded-full shadow-[0_0_10px_#C41BFD]" />
      </div>

      {/* Corner Glow Highlight */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};
