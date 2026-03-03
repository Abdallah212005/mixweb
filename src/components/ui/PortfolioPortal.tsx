
"use client";

import React from "react";
import { motion } from "framer-motion";

interface Project {
  title: string;
  category: string;
  image: string;
}

export const PortfolioPortal: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const displayTitle = project.title.split(" ")[0] + " " + project.title.split(" ")[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.03, boxShadow: "0 0 30px rgba(196, 27, 253, 0.2)" }}
      className="relative group cursor-pointer aspect-[3/4] w-full overflow-hidden rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-200 shadow-2xl flex flex-col"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover opacity-30 group-hover:opacity-80 grayscale group-hover:grayscale-0 transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      </div>

      <div className="relative z-10 h-full w-full p-6 flex flex-col justify-end">
        <div className="mb-4">
          <p className="text-[7px] font-code text-accent/70 uppercase tracking-[0.5em] mb-2">
            {project.category}
          </p>
          <h3 className="text-xl font-black leading-tight tracking-tighter text-white uppercase">
            {displayTitle}
          </h3>
        </div>
        <div className="h-0.5 w-0 group-hover:w-14 bg-accent transition-all duration-300 rounded-full" />
      </div>
    </motion.div>
  );
};
