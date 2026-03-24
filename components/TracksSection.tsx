"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Terminal, ArrowRight } from 'lucide-react';
import { Variants } from 'framer-motion';

export default function TracksSection({ tracks }: { tracks?: any[] }) {
  // If tracks are still loading or undefined, we show a clean skeleton or null
  // This ensures the admin has full control over the fallback state
  if (!tracks || tracks.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-20">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-[#161b22] border border-[#30363d] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { 
      y: 20, 
      opacity: 0 
    },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5, 
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {tracks.map((track, index) => (
        <Link key={index} href={track.id === "OI" ? `/open-innovation` : `/problems/${encodeURIComponent(track.title)}`}>
          <motion.div
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03, 
              borderColor: "#a371f7",
              boxShadow: "0 0 20px rgba(163, 113, 247, 0.2)"
            }}
            className="group relative flex flex-col justify-between p-6 min-h-32 bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-lg transition-all cursor-pointer overflow-hidden hover:shadow-xl active:scale-95"
          >
            {/* Gradient Background on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#a371f7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Header: ID Label & Arrow */}
            <div className="relative z-10 flex justify-between items-start mb-3">
              <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                <Terminal size={12} className="text-[#a371f7]" />
                <span className="text-[10px] font-mono text-[#8b949e] group-hover:text-[#a371f7] uppercase tracking-wider">
                  {track.id || `TRK_0${index + 1}`}
                </span>
              </div>
              <ArrowRight size={14} className="text-[#a371f7] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Dynamic Title from Admin Panel */}
            <h3 className="relative z-10 text-sm md:text-base font-bold text-[#a371f7] tracking-tight group-hover:text-white transition-colors leading-snug flex-grow">
              {track.title}
            </h3>

            {/* Visual Decoration - Bottom border */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#a371f7] to-[#8957e5] group-hover:w-full transition-all duration-500" />
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
}