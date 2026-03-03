
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.01 }}
      className="relative group cursor-pointer aspect-[3/4] w-full overflow-hidden rounded-[4rem] md:rounded-[5rem] border border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-700 shadow-xl flex flex-col"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover opacity-20 group-hover:opacity-40 grayscale group-hover:grayscale-0 transition-all duration-[1s]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
      </div>

      <div className="relative z-10 h-full w-full p-6 md:p-8 flex flex-col justify-end text-center">
        <div className="mb-6">
          <p className="text-[8px] font-code text-accent/60 uppercase tracking-[0.4em] mb-2">
            {project.category}
          </p>
          <h3 className="text-xl md:text-2xl font-black leading-[0.9] tracking-tighter text-white uppercase">
            {titleParts.map((part, i) => (
              <span key={i} className="block">
                {part}
              </span>
            ))}
          </h3>
        </div>
        <div className="mx-auto h-0.5 w-0 group-hover:w-12 bg-accent transition-all duration-700 rounded-full" />
      </div>
    </motion.div>
  );
};
