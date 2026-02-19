"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck, Terminal, Save, LogOut, User, Fingerprint, Database } from "lucide-react";

export default function ProfessionalJudgesPortal() {
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [judgeData, setJudgeData] = useState({ username: "", name: "" });
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    const formData = new FormData(e.target);
    const user = formData.get("username") as string;
    const pass = formData.get("password") as string;

    const { data } = await supabase
      .from("judge_accounts")
      .select("username, judge_display_name")
      .eq("username", user)
      .eq("password", pass)
      .single();

    if (data) {
      setIsLoggedIn(true);
      setJudgeData({ username: data.username, name: data.judge_display_name });
      fetchData();
    } else {
      setAuthError("CRITICAL: ACCESS DENIED. CREDENTIALS INVALID.");
    }
    setLoading(false);
  };

  const fetchData = async () => {
    const { data } = await supabase.from("teams").select("*, participants(*)").order('team_name');
    if (data) setTeams(data);
  };

  const submitScore = async (participantId: string, participantName: string, e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const btn = e.target.querySelector('button');
    
    const { error } = await supabase.from("individual_scores").insert([{
      participant_id: participantId,
      judge_name: judgeData.name, 
      innovation_score: parseInt(formData.get("innovation") as string),
      technical_score: parseInt(formData.get("technical") as string)
    }]);

    if (!error) {
      const originalText = btn.innerHTML;
      btn.innerHTML = "SYNCED";
      btn.style.backgroundColor = "#238636"; // Green feedback
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = "#a371f7";
        e.target.reset();
      }, 1500);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6 font-sans">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[#161b22] border border-[#30363d] p-10 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#a371f7]" />
          <div className="flex items-center gap-3 mb-6">
            <Lock className="text-[#a371f7]" size={24} />
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight leading-none">Judge <span className="text-[#a371f7]">Portal</span></h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="username" placeholder="XXXXXX" required className="w-full bg-[#0d1117] border border-[#30363d] p-4 rounded-xl text-white outline-none focus:border-[#a371f7] transition-all" />
            <input name="password" type="password" placeholder="********" required className="w-full bg-[#0d1117] border border-[#30363d] p-4 rounded-xl text-white outline-none focus:border-[#a371f7] transition-all" />
            {authError && <p className="text-red-500 text-[10px] font-bold py-2 font-mono">{authError}</p>}
            <button disabled={loading} className="w-full bg-[#a371f7] hover:bg-[#b388f9] text-white font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-sm shadow-lg">
              {loading ? "AUTHENTICATING..." : "INITIATE SESSION"}
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  return (
    // 💡 Top padding adjusted from pt-32 to pt-20 since Navbar is gone
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans pb-20">
      <div className="max-w-[1600px] mx-auto pt-20 px-6 flex flex-col lg:flex-row gap-10">
        
        {/* LEFT SIDE IDENTITY PANEL */}
        <aside className="lg:w-80 lg:sticky lg:top-20 h-fit space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#a371f7]" />
            <div className="flex items-center gap-3 text-[#a371f7] mb-8">
              <ShieldCheck size={20} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Session Secured</span>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-bold text-[#8b949e] uppercase block mb-2 tracking-widest">Authenticated Judge</label>
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight leading-tight">{judgeData.name}</h2>
              </div>
              
              <div className="pt-6 border-t border-[#30363d]">
                <label className="text-[10px] font-bold text-[#8b949e] uppercase block mb-2 tracking-widest">Terminal ID</label>
                <div className="inline-flex items-center gap-2 bg-[#0d1117] border border-[#30363d] py-2 px-4 rounded-lg text-[#a371f7] font-mono font-bold text-sm">
                  <Fingerprint size={14} />
                  {judgeData.username}
                </div>
              </div>
            </div>

            <button onClick={() => window.location.reload()} className="mt-12 w-full flex items-center justify-center gap-2 py-3 border border-[#30363d] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 text-[10px] font-bold text-[#8b949e] uppercase rounded-md transition-all tracking-[0.2em]">
              <LogOut size={14} /> Terminate
            </button>
          </div>
          
          <div className="p-6 bg-[#161b22]/40 border border-[#30363d] rounded-xl">
             <div className="flex items-center gap-2 text-[#8b949e] mb-4">
               <Database size={14} />
               <span className="text-[9px] font-bold uppercase tracking-widest">Network Node</span>
             </div>
             <div className="text-[11px] text-[#8b949e] space-y-2 font-mono">
               <p>Active Teams: {teams.length}</p>
               <p>Protocol: v2.0.26</p>
             </div>
          </div>
        </aside>

        {/* MAIN EVALUATION AREA */}
        <div className="flex-1 space-y-16">
          <header className="border-b border-[#30363d] pb-10 mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tighter leading-none italic">Welcome <span className="text-[#a371f7]">Judge</span></h1>
            <p className="text-[#8b949e] text-[10px] mt-4 uppercase tracking-[0.2em]">Authorized scoring sequence in progress.</p>
          </header>

          <div className="space-y-24">
            {teams.map(team => (
              <section key={team.id}>
                <h2 className="text-[10px] font-black text-[#a371f7] uppercase mb-8 tracking-[0.5em] flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-[#a371f7]" /> {team.team_name}
                </h2>
                <div className="grid gap-6">
                  {team.participants?.map((member: any) => (
                    <motion.div whileHover={{ x: 4 }} key={member.id} className="bg-[#161b22] border border-[#30363d] p-8 rounded-xl flex flex-col lg:flex-row items-center gap-10 relative group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#a371f7] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-full lg:w-1/3">
                        <div className="flex items-center gap-2 text-[#8b949e] mb-2">
                          <User size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Candidate</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{member.name}</h3>
                        <p className="text-[11px] text-[#a371f7] font-mono font-bold mt-1">{member.reg_number}</p>
                      </div>

                      <form onSubmit={(e) => submitScore(member.id, member.name, e)} className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[#8b949e] uppercase ml-1 tracking-widest">Innovation</label>
                          <input name="innovation" type="number" min="0" max="10" required placeholder="0-10" className="w-full bg-[#0d1117] border border-[#30363d] p-3.5 rounded-md text-sm outline-none focus:border-[#a371f7] transition-all font-mono" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[#8b949e] uppercase ml-1 tracking-widest">Technical</label>
                          <input name="technical" type="number" min="0" max="10" required placeholder="0-10" className="w-full bg-[#0d1117] border border-[#30363d] p-3.5 rounded-md text-sm outline-none focus:border-[#a371f7] transition-all font-mono" />
                        </div>
                        <div className="flex items-end">
                          <button type="submit" className="w-full bg-[#a371f7] hover:bg-[#b388f9] text-white font-bold uppercase text-[10px] py-4 rounded-md transition-all tracking-[0.3em] flex items-center justify-center gap-2 shadow-lg">
                            <Save size={16} /> Record
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}