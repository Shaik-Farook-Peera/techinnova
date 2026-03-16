"use client";
import { useEffect, useState } from "react";
import Link from "next/link"; 
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Cpu, Clock, ChevronRight, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Countdown from "@/components/Countdown";
import TracksSection from '@/components/TracksSection';
import Timeline from '@/components/Timeline';
import HowToCode from "@/components/HowToCode";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import GalaxyScene from "@/components/GalaxyScene"; 

export default function Page() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSettings() {
      const { data } = await supabase.from('site_config').select('*').single();
      if (data) setConfig(data);
      setLoading(false);
    }
    getSettings();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#30363d] border-t-[#a371f7] rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="relative min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans overflow-x-hidden">
      
      <div className="relative z-10">
        <Navbar />

        {/* 1. HERO SECTION */}
        <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <GalaxyScene />
          </div>
          <div className="absolute inset-0 bg-[url('https://github.githubassets.com/images/modules/site/home-campaign/hero-bg.webp')] bg-cover opacity-10 pointer-events-none z-[1]" />
          
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* DATE BADGE REMOVED AS REQUESTED */}

              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-tight mb-4 uppercase">
                {config?.hero_title || "TECHINNOVA"} 
                {/* 2K26 added beside title with custom purple accent */}
                <span className="text-[#a371f7] ml-1 md:ml-4 inline-block">
                  2K26
                </span>
              </h1>
              
              <p className="text-[#8b949e] text-lg md:text-xl max-w-2xl mx-auto mb-8 font-medium">
                Join the elite force of builders. Solving real-world problems through 
                <span className="text-white"> open-platform innovation.</span>
              </p>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
                <Link href="/register">
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(163, 113, 247, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-[#a371f7] hover:bg-[#b388f9] text-white font-bold rounded-md transition-all flex items-center gap-2 shadow-lg text-sm md:text-base uppercase tracking-tight"
                  >
                    Register Now <ChevronRight size={18} />
                  </motion.button>
                </Link>
                <Link href="#tracks">
                  <button className="px-8 py-3 bg-[#161b22] border border-[#30363d] hover:border-[#a371f7] hover:text-[#a371f7] text-white font-bold rounded-md transition-all text-sm md:text-base uppercase tracking-tight">
                    View Tracks
                  </button>
                </Link>
              </div>

              <div className="mt-16 py-8 border-y border-[#30363d]/50">
                <Countdown targetDate={config?.hero_date} /> 
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. TRACKS SECTION */}
        <section id="tracks" className="relative py-24 border-b border-[#30363d] bg-[#0d1117] z-20">
          <div className="max-w-7xl mx-auto px-6">
             <div className="flex items-center gap-4 mb-12">
                <Cpu className="text-[#8b949e]" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Project Tracks</h2>
                <div className="h-px flex-1 bg-[#30363d]"></div>
             </div>
             <TracksSection tracks={config?.tracks} />
          </div>
        </section>
        
        {/* 3. TIMELINE SECTION */}
        <section id="timeline" className="relative py-24 bg-[#0d1117] z-20 border-b border-[#30363d]">
          <div className="max-w-7xl mx-auto px-6">
             <div className="flex items-center gap-4 mb-12">
                <Clock className="text-[#8b949e]" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Event Timeline</h2>
                <div className="h-px flex-1 bg-[#30363d]"></div>
             </div>
             <Timeline timeline={config?.timeline} />
          </div>
        </section>

        <HowToCode />

        {/* 4. FAQ SECTION */}
        <section id="faq" className="relative py-24 bg-[#0d1117] z-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-12">
                <MessageSquare className="text-[#8b949e]" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Frequently Asked Questions</h2>
                <div className="h-px flex-1 bg-[#30363d]"></div>
             </div>

            <div className="max-w-4xl mx-auto">
               <FAQ limit={6} />
               <div className="mt-12 text-center">
                  <Link href="/faq">
                    <button className="px-6 py-2 text-sm font-medium text-[#a371f7] border border-[#30363d] rounded-md hover:border-[#a371f7] transition-all">
                      View more →
                    </button>
                  </Link>
               </div>
            </div>
          </div>
        </section>

        <Footer config={config} />
      </div>
    </main>
  );
}
