"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Search, Printer, Terminal, ShieldCheck, AlertCircle } from "lucide-react";

export default function CertificatePortal() {
  const [regNo, setRegNo] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const certTemplate = "https://tnprpbodxafmczebqxal.supabase.co/storage/v1/object/public/certificates/cert-template.png.png";

  const verifyCertificate = async () => {
    // 💡 Normalized Input: Force uppercase for case-insensitive matching
    const cleanRegNo = regNo.trim().toUpperCase(); 
    if (!cleanRegNo) return setError("CRITICAL: REGISTER ID REQUIRED.");
    
    setLoading(true);
    setError("");
    setUserData(null);

    // 💡 Query Update: Uses .ilike() for case-insensitive database matching
    const { data, error: dbError } = await supabase
      .from('quiz_submissions')
      .select('student_name, reg_no, team_id, score')
      .ilike('reg_no', cleanRegNo) 
      .single();

    if (dbError || !data) {
      setError("NO RECORD FOUND. CERTIFICATION REQUIRES QUIZ COMPLETION.");
      setLoading(false);
      return;
    }

    setUserData(data);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans no-print">
      <Navbar />

      <div className="max-w-5xl mx-auto pt-32 pb-20 px-6">
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 text-[#a371f7] mb-4">
            <Award size={28} />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Official Recognition</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter italic">
            TECHINNOVAR <span className="text-[#a371f7]">HACKATHON</span>
          </h1>
          <p className="text-[#8b949e] font-mono text-[10px] tracking-[0.3em] uppercase mt-4">
            Validated Quiz Certification Node
          </p>
        </header>

        <div className="max-w-2xl mx-auto bg-[#161b22] border border-[#30363d] rounded-xl p-10 shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#a371f7]" />
          
          <div className="flex items-center gap-2 mb-6 text-[#a371f7]">
            <Terminal size={18} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Verification Terminal</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input 
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-6 py-4 outline-none focus:border-[#a371f7] font-mono uppercase transition-all text-white placeholder:text-[#484f58]" 
                placeholder="ENTER OPERATIVE ID"
                value={regNo}
                // 💡 UI Update: The value is displayed as the user types it, but searched in uppercase
                onChange={(e) => setRegNo(e.target.value)}
              />
            </div>
            <button 
              onClick={verifyCertificate}
              disabled={loading}
              className="px-8 py-4 bg-[#a371f7] hover:bg-[#b388f9] text-white font-bold uppercase rounded-lg transition-all shadow-lg shadow-[#a371f7]/20 disabled:opacity-50 flex items-center justify-center gap-2 text-xs tracking-widest"
            >
              {loading ? "SEARCHING..." : <><Search size={16} /> VERIFY</>}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center gap-3 text-red-400 text-[10px] font-bold uppercase bg-red-400/10 p-4 rounded-lg border border-red-400/20"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {userData && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6 text-[#a371f7]">
              <ShieldCheck size={20} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Record Found: {userData.student_name}</span>
            </div>

            <div className="relative w-full aspect-[1.414/1] bg-white rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] text-black mb-12 group">
              <img src={certTemplate} alt="Certificate Template" className="w-full h-full object-contain" />
              
              <div className="absolute top-[46%] left-0 w-full text-center">
                <h2 className="text-[clamp(1.5rem,4vw,3.5rem)] font-bold uppercase tracking-tight text-[#1a2b3c]">
                  {userData.student_name}
                </h2>
              </div>

              <div className="absolute bottom-[9%] left-[10%] opacity-60">
                <p className="text-[clamp(0.5rem,1.1vw,0.8rem)] font-mono font-bold uppercase">CERT ID: TIH-26-{userData.reg_no}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={() => window.print()} 
                className="px-12 py-5 bg-[#a371f7] hover:bg-[#b388f9] text-white font-bold uppercase rounded-md transition-all shadow-xl flex items-center gap-3 tracking-[0.2em] text-xs shadow-[#a371f7]/20"
              >
                <Printer size={18} />
                Generate Official Document
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          .no-print, nav { display: none !important; }
          body { background: white !important; }
          @page { size: landscape; margin: 0; }
        }
      `}</style>
    </main>
  );
}