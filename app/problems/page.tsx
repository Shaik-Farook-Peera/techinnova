"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default function TracksPage() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTracks() {
      const { data } = await supabase
        .from('config')
        .select('tracks')
        .single();
      
      if (data?.tracks) {
        setTracks(data.tracks);
      }
      setLoading(false);
    }
    fetchTracks();
  }, []);

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9] pt-32 pb-20 px-6 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-12 text-[#8b949e] hover:text-[#a371f7] transition-all group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return to Home</span>
        </Link>

        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">
            Problem <span className="text-[#a371f7]">Tracks</span>
          </h1>
          <p className="text-[#8b949e] mt-4">Select a track to explore problem statements and challenges</p>
        </header>

        {loading ? (
          <div className="text-center text-[#8b949e]">Loading tracks...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track, index) => (
              <Link key={track} href="/#tracks">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative p-8 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#a371f7]/50 transition-all cursor-pointer h-full flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#a371f7] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white uppercase group-hover:text-[#a371f7] transition-colors">
                      {track}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-6 text-[#a371f7] group-hover:gap-4 transition-all">
                    <span className="text-xs font-bold uppercase tracking-wider">Go to Track</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
