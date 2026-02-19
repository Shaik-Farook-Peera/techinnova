"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Terminal, ArrowRight } from 'lucide-react';

export default function TracksSection({ tracks }: { tracks?: any[] }) {
  // If tracks are still loading or undefined, we show a clean skeleton or null
  // This ensures the admin has full control over the fallback state
  if (!tracks || tracks.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 opacity-20">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gh-panel border border-gh-border rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {tracks.map((track, index) => (
        <Link key={index} href={`/problems/${encodeURIComponent(track.title)}`}>
          <motion.div
            variants={itemVariants}
            whileHover={{ 
              scale: 1.02, 
              borderColor: "#8957e5",
              backgroundColor: "#1c2128" 
            }}
            className="group relative flex flex-col justify-between p-5 h-28 bg-gh-panel border border-gh-border rounded-md transition-all cursor-pointer overflow-hidden"
          >
            {/* Header: ID Label & Arrow */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                <Terminal size={10} className="text-[#a371f7]" />
                <span className="text-[9px] font-mono text-gh-muted group-hover:text-[#a371f7]">
                  {/* Pull ID from admin if available, else use index */}
                  {track.id || `TRK_0${index + 1}`}
                </span>
              </div>
              <ArrowRight size={12} className="text-[#a371f7] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </div>

            {/* Dynamic Title from Admin Panel */}
            <h3 className="text-base md:text-lg font-bold text-[#a371f7] tracking-tight group-hover:text-white transition-colors">
              {track.title}
            </h3>

            {/* Visual Decoration */}
            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#8957e5] group-hover:w-full transition-all duration-500" />
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
}