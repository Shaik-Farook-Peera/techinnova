"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Users, Phone, Mail, ArrowLeft, Terminal, Layout } from "lucide-react";

export default function AboutAndCoordinators() {
  const [staff, setStaff] = useState<any[]>([]);
   const [Cheif, setCheif] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
  const { data: cfgData } = await supabase.from('site_config').select('*').single();
  if (cfgData) setConfig(cfgData);

  // Added 'error' to the destructuring to see what's wrong
  const { data: coordData, error } = await supabase
    .from('coordinators')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error("Supabase Error:", error.message); // Check your browser console (F12)
    setLoading(false);
    return;
  }

  if (coordData) {
    setStaff(coordData.filter(c => c.role === 'Staff'));
    setCheif(coordData.filter(c => c.role === 'Cheif'));
    setStudents(coordData.filter(c => c.role === 'Student'));
  }
  setLoading(false);
}
    fetchData();
  }, []);

  const CoordinatorCard = ({ person }: { person: any }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#a371f7]/50 transition-all group shadow-xl flex flex-col items-center text-center md:items-start md:text-left relative overflow-hidden h-full"
    >
      {/* Brand Accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-[#a371f7] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 bg-[#a371f7] rounded-full blur-md opacity-10 group-hover:opacity-30 transition-opacity" />
        <div className="relative w-full h-full rounded-full border border-[#30363d] overflow-hidden group-hover:border-[#a371f7] transition-colors bg-[#0d1117]">
          {person.image_url ? (
            <img 
              src={person.image_url} 
              alt={person.name} 
              className="w-full h-full object-cover  transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0d1117]">
              <Users className="text-[#8b949e] w-8 h-8 opacity-30" />
            </div>
          )}
        </div>
      </div>

      <h4 className="text-white font-bold uppercase text-lg mb-1 group-hover:text-[#a371f7] transition-colors tracking-tight">
        {person.name}
      </h4>
      <p className="text-[#a371f7] text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
        {person.designation}
      </p>
      
      <div className="mt-auto pt-4 border-t border-[#30363d] w-full text-[#8b949e] text-xs space-y-3 font-mono">
        <p className="flex items-center gap-3 justify-center md:justify-start">
          <Phone size={14} className="text-[#a371f7]" /> {person.phone}
        </p>
        {person.email && (
          <p className="flex items-center gap-3 justify-center md:justify-start">
            <Mail size={14} className="text-[#a371f7]" /> {person.email}
          </p>
        )}
      </div>
    </motion.div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-[#a371f7] font-bold uppercase tracking-[0.3em] animate-pulse">
      Loading...
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto pt-32 pb-20 px-6">
        {/* HERO SECTION: CONSISTENT TYPOGRAPHY */}
        <section className="mb-24">
          <Link href="/" className="inline-flex items-center gap-2 mb-10 text-[#8b949e] hover:text-[#a371f7] transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Return to Dashboard</span>
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold text-white uppercase mb-8 tracking-tighter">
            About <span className="text-[#a371f7]">IIC</span>
          </h1>
          
          <div className="max-w-3xl p-6 bg-[#161b22] border border-[#30363d] rounded-xl">
            <p className="text-sm md:text-base text-[#8b949e] leading-relaxed font-medium">
              {config?.about_iic || "About IIC is currently being updating..."}
            </p>
          </div>
        </section>

        {/* COORDINATORS SECTION */}
        <section className="space-y-24">
          <header>

             <h1 className="text-4xl md:text-6xl font-bold text-white uppercase mb-8 tracking-tighter">
            About <span className="text-[#a371f7]">TechInnova</span>
          </h1>
             <div className="max-w-3xl p-6 bg-[#161b22] border border-[#30363d] rounded-xl">
            <p className="text-sm md:text-base text-[#8b949e] leading-relaxed font-medium">
              {config?.about_event || "About  is currently being updating..."}
            </p>
          </div>
          </header>

          {/* IIC Cheaf Members */}
          <div>
            <div className="flex items-center gap-4 mb-10">
              <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.4em] whitespace-nowrap">IIC Cheif Members</h3>
              <div className="w-full h-px bg-[#30363d]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Cheif.map(p => <CoordinatorCard key={p.id} person={p} />)}
            </div>
          </div>
{/* STAFF */}
          <div>
            <div className="flex items-center gap-4 mb-10">
              <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.4em] whitespace-nowrap">Faculty Coordinator</h3>
              <div className="w-full h-px bg-[#30363d]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map(p => <CoordinatorCard key={p.id} person={p} />)}
            </div>
          </div>
          {/* STUDENTS */}
          <div>
            <div className="flex items-center gap-4 mb-10">
              <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.4em] whitespace-nowrap">Student Coordinator</h3>
              <div className="w-full h-px bg-[#30363d]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map(p => <CoordinatorCard key={p.id} person={p} />)}
            </div>
          </div>
        </section>
      </div>

      <Footer config={config} />
    </main>
  );
}