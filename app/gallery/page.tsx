"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, Image as ImageIcon, ArrowLeft, Database } from "lucide-react";

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Gallery Images from database
      const { data: galleryData } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      if (galleryData) setImages(galleryData);

      // 2. Fetch Config for Footer
      const { data: cfgData } = await supabase.from('site_config').select('*').single();
      if (cfgData) setConfig(cfgData);
      
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="text-[#a371f7] font-bold uppercase tracking-[0.3em] animate-pulse flex items-center gap-3">
        Loading Images...
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto pt-32 pb-20 px-6">
        {/* HEADER SECTION */}
        <section className="mb-20">
          <Link href="/" className="inline-flex items-center gap-2 mb-10 text-[#8b949e] hover:text-[#a371f7] transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Return to Dashboard</span>
          </Link>
          
    

          <h1 className="text-2xl md:text-4xl font-bold text-white uppercase mb-8 tracking-tighter">
            Techinnova 2K26 <span className="text-[#a371f7]">Archives</span>
          </h1>
        </section>

        {/* MASONRY GRID WITH REFINED CARD STYLES */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((img) => (
            <motion.div 
              key={img.id} 
              whileHover={{ y: -5 }}
              className="relative group overflow-hidden rounded-xl border border-[#30363d] break-inside-avoid shadow-xl bg-[#161b22]"
            >
              <img 
                src={img.image_url} 
                alt={img.caption} 
                className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
              />
              
              {/* BRAND ACCENT EDGE */}
              <div className="absolute top-0 left-0 w-1 h-full bg-[#a371f7] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* OVERLAY ON HOVER - REFINED PURPLE GRADIENT */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                <div className="flex items-center gap-2 text-[#a371f7] mb-2">
                  <ImageIcon size={12} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em]">asset_log.db</span>
                </div>
                <h4 className="text-white font-bold uppercase text-lg leading-tight tracking-tight">
                  {img.caption || "Classified Asset"}
                </h4>
              </div>
            </motion.div>
          ))}
        </div>

        {/* EMPTY STATE WITH 404 TV DESIGN */}
        {images.length === 0 && (
          <div className="relative flex items-center justify-center w-full max-w-5xl h-[300px] md:h-[300px]">
                    {/* TV Container (Acts as the center) */}
            <div className="relative z-10 flex flex-col items-center w-[140px] sm:w-[200px] md:w-[200px] lg:w-[320px]">
              
              {/* Antennas - Responsive heights */}
              <div className="flex gap-12 md:gap-20 -mb-2 md:-mb-4">
                <motion.div 
                  initial={{ rotate: -25 }}
                  animate={{ rotate: [-24, -26, -24] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-1 md:w-1.5 h-16 md:h-24 bg-[#30363d] origin-bottom rounded-full relative"
                >
                  <div className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 bg-[#30363d] rounded-full absolute -top-1 -left-1" />
                </motion.div>
                <motion.div 
                  initial={{ rotate: 25 }}
                  animate={{ rotate: [26, 24, 26] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-1 md:w-1.5 h-16 md:h-24 bg-[#30363d] origin-bottom rounded-full relative"
                >
                  <div className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 bg-[#30363d] rounded-full absolute -top-1 -left-1" />
                </motion.div>
              </div>

              {/* Purple TV Body with Glow */}
              <div className="w-full aspect-[1.3/1] bg-[#a371f7] rounded-[2.5rem] md:rounded-[3.5rem] p-3 md:p-5 shadow-[0_0_50px_rgba(163,113,247,0.2)] border-b-[6px] md:border-b-[12px] border-black/20 relative">
                <div className="flex h-full gap-2 md:gap-4">
                  
                  {/* Screen Area */}
                  <div className="flex-[3.5] bg-[#161b22] rounded-2xl md:rounded-[2.5rem] border-[4px] md:border-[8px] border-[#0d1117] relative overflow-hidden flex items-center justify-center">
                     {/* Moving Static Noise */}
                     <motion.div 
                       animate={{ backgroundPosition: ["0px 0px", "120px 120px"] }}
                       transition={{ repeat: Infinity, duration: 0.15, ease: "linear" }}
                       className="absolute inset-0 opacity-[0.35] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
                     />
                     
                     {/* Floating Badge */}
                     <motion.div 
                        animate={{ y: [0, -3, 0], opacity: [1, 0.8, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className=" px-3 md:px-6 py-1.5 rounded-sm z-20 "
                     >
                       <span className="text-white font-black text-[15px] md:text-[15px] tracking-widest uppercase italic block">
                         No Images
                       </span>
                     </motion.div>
                  </div>

                  {/* Functional Knobs */}
                  <div className="flex-1 flex flex-col justify-center items-center gap-3 md:gap-6">
                    <div className="w-7 h-7 md:w-12 md:h-12 rounded-full bg-[#0d1117] border-2 md:border-4 border-black/30 flex items-center justify-center shadow-inner group cursor-pointer">
                       <div className="w-1 md:w-1.5 h-4 md:h-6 bg-[#30363d] rounded-full rotate-45 group-hover:rotate-90 transition-transform" />
                    </div>
                    <div className="w-7 h-7 md:w-12 md:h-12 rounded-full bg-[#0d1117] border-2 md:border-4 border-black/30 flex items-center justify-center shadow-inner group cursor-pointer">
                       <div className="w-1 md:w-1.5 h-4 md:h-6 bg-[#30363d] rounded-full -rotate-12 group-hover:-rotate-45 transition-transform" />
                    </div>
                    <div className="flex flex-col gap-1.5 w-8 md:w-12 mt-2 opacity-20">
                      <div className="h-1.5 bg-black rounded-full" />
                      <div className="h-1.5 bg-black rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feet */}
              <div className="flex justify-between w-3/4 px-6 -mt-1">
                <div className="w-5 md:w-8 h-3 md:h-4 bg-[#161b22] rounded-b-xl" />
                <div className="w-5 md:w-8 h-3 md:h-4 bg-[#161b22] rounded-b-xl" />
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer config={config} />
    </main>
  );
}