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
          
    

          <h1 className="text-4xl md:text-6xl font-bold text-white uppercase mb-8 tracking-tighter">
            Visual <span className="text-[#a371f7]">Archives</span>
          </h1>
          <p className="text-[#8b949e] max-w-2xl text-sm leading-relaxed font-medium">
            Intelligence gathered from past technological operations and field deployments.
          </p>
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

        {/* EMPTY STATE */}
        {images.length === 0 && (
          <div className="py-32 text-center border border-dashed border-[#30363d] rounded-2xl bg-[#161b22]/50">
            <ImageIcon className="mx-auto text-[#484f58] mb-4" size={40} />
            <p className="text-[#8b949e] font-mono uppercase tracking-widest text-xs"></p>
          </div>
        )}
      </div>

      <Footer config={config} />
    </main>
  );
}