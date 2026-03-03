
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
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
      whileHover={{ y: -10 }}
      className="relative group cursor-pointer aspect-video md:aspect-[4/5] overflow-hidden rounded-xl border border-primary/20 bg-card/40 backdrop-blur-md"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-80" />
      
      {/* Subtle glitch image container */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60"
        />
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
      </div>

      <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
        <motion.p 
          className="text-xs font-code text-accent uppercase tracking-widest mb-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 + index * 0.1 }}
        >
          {project.category}
        </motion.p>
        <motion.h3 
          className="text-2xl md:text-3xl font-bold tracking-tight mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 + index * 0.1 }}
        >
          {project.title}
        </motion.h3>
        <div className="h-px w-0 group-hover:w-full bg-primary transition-all duration-500" />
      </div>

      {/* Holographic lines */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse delay-75" />
      </div>
    </motion.div>
  );
};
