"use client";
import React, { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function FullFAQPage() {
  const [config, setConfig] = useState<any>(null);

  // Fetching config to ensure the Footer and branding receive the correct event data
  useEffect(() => {
    async function getSettings() {
      // Pulling the latest site config to ensure 'contact_title' and branding are synced
      const { data } = await supabase.from('site_config').select('*').single();
      if (data) setConfig(data);
    }
    getSettings();
  }, []);

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Navigation Breadcrumb - Forced Purple hover to replace old blue */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[#8b949e] hover:text-[#a371f7] transition-colors mb-8 text-sm font-medium group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Home
        </Link>

        {/* 💡 CONSISTENT HEADER: Purple Accent Icon */}
        <div className="flex items-center gap-4 mb-12">
          {/* Cyan icon replaced with Purple [#a371f7] */}
          <MessageSquare size={24} className="text-[#a371f7]" />
          <h1 className="text-3xl font-bold text-white tracking-tight uppercase">
            Frequently Asked Questions
          </h1>
          <div className="h-px flex-1 bg-[#30363d]"></div>
        </div>

        {/* Full FAQ List */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Note: Ensure the FAQ component internal styles are also updated to #a371f7 */}
          <FAQ />
        </motion.div>

        {/* Support Footer */}
        <div className="mt-16 pt-8 border-t border-[#30363d] text-center">
          <p className="text-sm text-[#8b949e]">
            Still have questions? Reach out to us via our official contact channels.
          </p>
        </div>
      </div>

      {/* Footer handles dynamic 'contact_title' and 'TechInnovator' branding */}
      <Footer config={config} />
    </main>
  );
}