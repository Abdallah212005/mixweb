
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
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -15, scale: 1.02 }}
      className="relative group cursor-pointer aspect-[2/3.8] w-full min-w-[200px] overflow-hidden rounded-[6rem] md:rounded-[10rem] border border-white/10 bg-black/50 backdrop-blur-2xl transition-all duration-1000 shadow-2xl flex flex-col"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover opacity-20 group-hover:opacity-70 grayscale group-hover:grayscale-0 transition-all duration-[1.5s] scale-110 group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
      </div>

      <div className="relative z-10 h-full w-full p-10 md:p-14 flex flex-col justify-end text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className="mb-12 md:mb-16"
        >
          <p className="text-[11px] md:text-[12px] font-code text-accent/80 uppercase tracking-[0.6em] mb-6 md:mb-8">
            {project.category}
          </p>
          <h3 className="text-4xl md:text-6xl font-black leading-[0.75] tracking-tighter text-white uppercase break-words">
            {titleParts.map((part, i) => (
              <span key={i} className="block">
                {part}
              </span>
            ))}
          </h3>
        </motion.div>
        
        <div className="mx-auto h-2 w-0 group-hover:w-24 md:group-hover:w-32 bg-accent transition-all duration-1000 ease-out rounded-full shadow-[0_0_25px_#C41BFD]" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    </motion.div>
  );
};
