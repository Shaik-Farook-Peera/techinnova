"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Globe, ArrowLeft, X, Cpu } from "lucide-react";

export default function ProblemStatements() {
  const { track } = useParams();
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrackProblems() {
      const { data } = await supabase
        .from('problem_statements')
        .select('*')
        .eq('track_name', decodeURIComponent(track as string));
      if (data) setProblems(data);
      setLoading(false);
    }
    fetchTrackProblems();
  }, [track]);

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9] pt-32 pb-20 px-6 font-sans">
      <Navbar />
      
      {/* DETAILED VIEW MODAL - Unified with Dashboard Popups */}
      <AnimatePresence>
        {selectedProblem && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-[#0d1117]/95 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-2xl w-full bg-[#161b22] border border-[#30363d] p-8 md:p-10 rounded-2xl shadow-2xl relative"
            >
              <button onClick={() => setSelectedProblem(null)} className="absolute top-6 right-6 text-[#8b949e] hover:text-white transition-colors">
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <Terminal size={16} className="text-[#a371f7]" />
                <span className="text-[#a371f7] font-mono text-[10px] font-bold uppercase tracking-widest">
                  ID: {selectedProblem.id}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white uppercase mb-6 tracking-tight leading-tight">
                {selectedProblem.problem_title}
              </h2>
              
              <div className="space-y-6">
                {/* 1. MISSION OBJECTIVE SECTION */}
                <div className="bg-[#0d1117] p-5 rounded-xl border border-[#30363d]">
                  <h4 className="text-[#a371f7] text-[10px] font-bold uppercase tracking-widest mb-3">Description</h4>
                  <p className="text-[#8b949e] text-sm leading-relaxed">
                    {selectedProblem.full_problem || selectedProblem.description}
                  </p>
                </div>

                {/* 2. AI TOOLS SECTION */}
                <div className="px-1">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-[#a371f7] text-[10px] font-bold uppercase tracking-widest">AI Tools You Can Use</h4>
                  </div>
                  <p className="text-[#8b949e] text-sm leading-relaxed">
                    {selectedProblem.technologies 
                      ? `You can leverage ${selectedProblem.technologies.split(',').map((t: string) => t.trim()).join(', ')} to solve this challenge.`
                      : "No specific AI tools recommended for this challenge."}
                  </p>
                </div>

                {/* 3. CALL TO ACTION */}
                <Link 
                  href={`/register?track=${track}&probId=${selectedProblem.id}`} 
                  className="block w-full py-4 bg-[#a371f7] hover:bg-[#b388f9] text-white text-center font-bold uppercase rounded-lg transition-all text-xs tracking-widest mt-4"
                >
                 Register Now
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <Link href="/#tracks" className="inline-flex items-center gap-2 mb-12 text-[#8b949e] hover:text-[#a371f7] transition-all group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return to Tracks</span>
        </Link>

        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">
            {decodeURIComponent(track as string)} <span className="text-[#a371f7]">Challenges</span>
          </h1>
        </header>

        <div className="grid grid-cols-4 gap-6">
          {problems.map((p) => (
            <motion.div 
              key={p.id} 
              className="group relative p-8 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#a371f7]/50 transition-all flex flex-col h-[320px]"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#a371f7] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="mb-6">
                <span className="text-[#a371f7] font-mono text-[10px] font-bold border border-[#a371f7]/30 px-3 py-1 rounded-full uppercase">
                  {p.id}
                </span>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-white uppercase mb-4 leading-tight group-hover:text-[#a371f7] transition-colors line-clamp-2">
                {p.problem_title}
              </h3>
              
              <p className="text-[#8b949e] text-xs leading-relaxed line-clamp-3 mb-8 flex-grow">
                {p.description || "Mission parameters are currently classified under standard deployment protocols."}
              </p>

              <button 
                onClick={() => setSelectedProblem(p)}
                className="w-full py-3.5 border border-[#30363d] text-[#c9d1d9] hover:bg-white hover:text-black text-[10px] font-bold uppercase rounded-lg transition-all tracking-widest"
              >
                View Full Details
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}