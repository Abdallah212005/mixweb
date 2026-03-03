
"use client";

import React from "react";
import { motion } from "framer-motion";

interface Project {
  title: string;
  category: string;
  image: string;
}

export const PortfolioPortal: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  // Split title for the "stacked" large text look
  const titleParts = project.title.split(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -12, scale: 1.02 }}
      className="relative group cursor-pointer aspect-[2/3] overflow-hidden rounded-[4rem] border border-white/10 bg-black/40 backdrop-blur-2xl transition-all duration-500"
    >
      {/* Background Image with darken overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover opacity-20 group-hover:opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full w-full p-8 flex flex-col justify-end">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          className="mb-4"
        >
          <p className="text-[10px] font-code text-accent/80 uppercase tracking-[0.4em] mb-2">
            {project.category}
          </p>
          <h3 className="text-4xl md:text-5xl font-bold leading-[0.9] tracking-tighter text-white uppercase break-words">
            {titleParts.map((part, i) => (
              <span key={i} className="block">
                {part}
              </span>
            ))}
          </h3>
        </motion.div>
        
        <div className="h-1 w-0 group-hover:w-12 bg-accent transition-all duration-500 ease-out" />
      </div>

      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
    </motion.div>
  );
};
