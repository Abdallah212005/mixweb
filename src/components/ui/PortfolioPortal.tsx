
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
      whileHover={{ y: -10, scale: 1.01 }}
      className="relative group cursor-pointer aspect-[2/3] w-full overflow-hidden rounded-[5rem] md:rounded-[7rem] border border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-700 shadow-xl flex flex-col"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover opacity-30 group-hover:opacity-60 grayscale group-hover:grayscale-0 transition-all duration-[1s]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
      </div>

      <div className="relative z-10 h-full w-full p-8 md:p-10 flex flex-col justify-end text-center">
        <div className="mb-8">
          <p className="text-[9px] font-code text-accent/70 uppercase tracking-[0.5em] mb-4">
            {project.category}
          </p>
          <h3 className="text-3xl md:text-4xl font-black leading-[0.8] tracking-tighter text-white uppercase">
            {titleParts.map((part, i) => (
              <span key={i} className="block">
                {part}
              </span>
            ))}
          </h3>
        </div>
        <div className="mx-auto h-1 w-0 group-hover:w-16 bg-accent transition-all duration-700 rounded-full" />
      </div>
    </motion.div>
  );
};
