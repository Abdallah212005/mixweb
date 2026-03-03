
"use client";

import React from "react";
import { motion } from "framer-motion";

interface Project {
  title: string;
  category: string;
  image: string;
}

export const PortfolioPortal: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const titleParts = project.title.split(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="relative group cursor-pointer aspect-[2/3.5] w-full overflow-hidden rounded-[5rem] md:rounded-[7rem] border border-white/10 bg-black/40 backdrop-blur-3xl transition-all duration-700 shadow-2xl flex flex-col"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover opacity-20 group-hover:opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/95" />
      </div>

      <div className="relative z-10 h-full w-full p-8 md:p-10 flex flex-col justify-end text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + index * 0.1 }}
          className="mb-8 md:mb-12"
        >
          <p className="text-[10px] md:text-[11px] font-code text-accent/80 uppercase tracking-[0.5em] mb-4 md:mb-6">
            {project.category}
          </p>
          <h3 className="text-3xl md:text-5xl font-black leading-[0.8] tracking-tighter text-white uppercase break-words">
            {titleParts.map((part, i) => (
              <span key={i} className="block">
                {part}
              </span>
            ))}
          </h3>
        </motion.div>
        
        <div className="mx-auto h-1.5 w-0 group-hover:w-16 md:group-hover:w-20 bg-accent transition-all duration-700 ease-out rounded-full shadow-[0_0_20px_#C41BFD]" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
    </motion.div>
  );
};
