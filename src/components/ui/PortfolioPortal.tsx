
"use client";

import React from "react";
import { motion } from "framer-motion";

interface Project {
  title: string;
  category: string;
  image: string;
}

export const PortfolioPortal: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
      className="relative group cursor-pointer aspect-[3/4] overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 opacity-60" />
      
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-30 group-hover:opacity-50 grayscale hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-accent/5 mix-blend-overlay" />
      </div>

      <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
        <motion.p 
          className="text-[10px] font-code text-accent/70 uppercase tracking-[0.3em] mb-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 + index * 0.1 }}
        >
          {project.category}
        </motion.p>
        <motion.h3 
          className="text-2xl font-bold tracking-tight mb-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 + index * 0.1 }}
        >
          {project.title}
        </motion.h3>
        <div className="h-[2px] w-0 group-hover:w-full bg-accent transition-all duration-700 ease-in-out" />
      </div>

      {/* Lens flare effect on hover */}
      <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
    </motion.div>
  );
};
