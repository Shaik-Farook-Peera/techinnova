"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // 💡 Needed to reach the Success Page
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, UserPlus, ShieldAlert, CheckCircle2, ArrowLeft, Cpu, Trash2, Phone } from "lucide-react";
import confetti from "canvas-confetti";

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1117]" />}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter(); // 💡 Needed to navigate to WhatsApp link page
  const searchParams = useSearchParams();
  const initialTrack = searchParams.get("track") || "";
  const initialProbId = searchParams.get("probId") || "";

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ show: boolean; type: 'success' | 'denied'; message: string; id?: string }>({ 
    show: false, type: 'success', message: "" 
  });
  
  const [branches, setBranches] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [dbProblems, setDbProblems] = useState<any[]>([]); 

  const [teamName, setTeamName] = useState("");
  const [track, setTrack] = useState(initialTrack); 
  const [probId, setProbId] = useState(initialProbId); 
  const [probName, setProbName] = useState("");
  const [cfg, setCfg] = useState<any>(null);

  const [members, setMembers] = useState([
    { name: "", branch: "", section: "", year: "", reg_number: "", email: "", phone: "" },
    { name: "", branch: "", section: "", year: "", reg_number: "", email: "", phone: "" }
  ]);

  useEffect(() => {
    async function loadData() {
      const { data: regData } = await supabase.from('registration_config').select('*').single();
      if (regData) {
        setCfg(regData);
        setBranches(regData.branches || []);
        setYears(regData.years || []);
        setSections(regData.sections || []);
      }
      const { data: problemsData } = await supabase.from('problem_statements').select('id, track_name, problem_title');
      if (problemsData) {
        setDbProblems(problemsData);
        if (initialProbId) {
          const matched = problemsData.find(x => x.id === initialProbId);
          if (matched) setProbName(matched.problem_title);
        }
      }
    }
    loadData();
  }, [initialProbId]);

  const availableTracks = Array.from(new Set(dbProblems.map(p => p.track_name)));

  const handleUpdate = (idx: number, field: string, val: string) => {
    const next = [...members];
    if (field === 'reg_number') {
        (next[idx] as any)[field] = val.toUpperCase();
    } else {
        (next[idx] as any)[field] = val;
    }
    setMembers(next);
  };

  const removeMember = (idx: number) => {
    if (members.length <= 1) return;
    const filtered = members.filter((_, i) => i !== idx);
    setMembers(filtered);
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    if (!probId) return;
    setLoading(true);

    const processedMembers = members.map(m => {
        const cleanReg = m.reg_number.trim().toUpperCase();
        const cleanPhone = m.phone.replace(/\D/g, ''); 
        const generatedPassword = cleanReg.slice(0, -1) + cleanPhone.slice(-5);
        return { ...m, reg_number: cleanReg, password: generatedPassword };
    });

    const leadEmail = processedMembers[0].email;
    const genId = `TI26-${teamName.substring(0,3).toUpperCase()}-${Math.random().toString(36).substring(2,7).toUpperCase()}`;

    const { data: teamCheck } = await supabase.from("teams").select("hackathon_id").eq("lead_email", leadEmail).single();
    if (teamCheck) {
      setLoading(false);
      return setModal({ show: true, type: 'denied', message: `Leader is assigned to team.`, id: teamCheck.hackathon_id });
    }

    const { data: team, error: tErr } = await supabase.from("teams").insert([{
      team_name: teamName.toUpperCase(), 
      hackathon_id: genId, 
      lead_email: leadEmail,
      track, 
      problem_id: probId, 
      problem_name: probName
    }]).select().single();

    if (tErr) { setLoading(false); return setModal({ show: true, type: 'denied', message: "" }); }

    const { error: pErr } = await supabase.from("participants").insert(
      processedMembers.map((m, i) => ({ team_id: team.id, ...m, is_leader: i === 0 }))
    );

    if (pErr) {
      await supabase.from("teams").delete().eq("id", team.id);
      setLoading(false);
      return setModal({ show: true, type: 'denied', message: "Submission Error." });
    }

    // 💡 REDIRECT LOGIC: This sends them to the WhatsApp link page
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#a371f7', '#ffffff'] });
    setLoading(false);
    
    setTimeout(() => {
        router.push(`/success?teamId=${genId}`); // Go to Success Page
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#0d1117] pt-32 pb-20 px-6 text-[#c9d1d9] font-sans">
      <Navbar />
      
      <AnimatePresence>
        {modal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0d1117]/90 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`max-w-md w-full p-8 rounded-2xl border ${modal.type === 'success' ? 'border-[#a371f7]/30 bg-[#161b22]' : 'border-red-500/30 bg-[#161b22]'} shadow-2xl text-center relative overflow-hidden`}>
              <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white uppercase mb-2">Already Registered</h2>
              <p className="text-[#8b949e] text-sm mb-6">{modal.message}</p>
              <button onClick={() => setModal({ ...modal, show: false })} className="w-full py-3 bg-[#30363d] hover:bg-[#444c56] text-white font-bold rounded-md transition-colors uppercase text-sm">
                Ok
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
         
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">Team <span className="text-[#a371f7]">Registration</span></h1>
        </header>
        
        <form onSubmit={handleRegister} className="space-y-8">
          <section className="bg-[#161b22] p-8 rounded-xl border border-[#30363d]">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input required placeholder="TEAM NAME" value={teamName} onChange={e => setTeamName(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3 outline-none focus:border-[#a371f7] transition-colors text-sm uppercase" />
                <select required value={track} onChange={e => setTrack(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3 outline-none focus:border-[#a371f7] transition-colors text-sm cursor-pointer">
                    <option value="">SELECT DOMAIN</option>
                    {availableTracks.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
             </div>
          </section>

          <div className="space-y-4">
            {members.map((m, i) => (
              <div key={i} className="p-8 bg-[#161b22] border border-[#30363d] rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#a371f7]" />
                <div className="flex justify-between items-center mb-6 text-[#a371f7] text-xs font-bold uppercase tracking-widest">
                  <span>{i === 0 ? "Fleet Leader (Member 01)" : `Member 0${i+1}`}</span>
                  {i !== 0 && <Trash2 size={16} className="text-red-500 cursor-pointer" onClick={() => removeMember(i)} />}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input placeholder="Full Name" required value={m.name} onChange={e => handleUpdate(i, 'name', e.target.value)} className="bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7]" />
                  <input placeholder="Reg Number" required value={m.reg_number} onChange={e => handleUpdate(i, 'reg_number', e.target.value)} className="bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7] font-mono uppercase" />
                  <input placeholder="Email" type="email" required value={m.email} onChange={e => handleUpdate(i, 'email', e.target.value)} className="bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7]" />
                  
                  {/* 💡 ADJUSTED PHONE SPACE: Occupies full row for better layout */}
                  <div className="md:col-span-3 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone size={12} className="text-[#a371f7]" />
                      <label className="text-[10px] text-[#8b949e] uppercase font-bold tracking-widest">Mobile Number</label>
                    </div>
                    <input  type="tel" required value={m.phone} onChange={e => handleUpdate(i, 'phone', e.target.value)} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7]" />
                  </div>

                  <select required value={m.branch} onChange={e => handleUpdate(i, 'branch', e.target.value)} className="bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7] cursor-pointer">
                    <option value="" className="bg-[#0d1117]">Branch</option>
                    {branches.map(b => <option key={b} value={b} className="bg-[#0d1117]">{b}</option>)}
                  </select>
                  <select required value={m.year} onChange={e => handleUpdate(i, 'year', e.target.value)} className="bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7] cursor-pointer">
                    <option value="" className="bg-[#0d1117]">Year</option>
                    {years.map(y => <option key={y} value={y} className="bg-[#0d1117]">{y}</option>)}
                  </select>
                </div>
              </div>
            ))}
            {members.length < 4 && (
              <button type="button" onClick={() => setMembers([...members, { name: "", branch: "", section: "", year: "", reg_number: "", email: "", phone: "" }])} className="w-full py-4 border border-dashed border-[#30363d] rounded-xl text-[#8b949e] hover:text-[#a371f7] uppercase text-[10px] flex items-center justify-center gap-2">
                <UserPlus size={14} /> ADD MEMBERS
              </button>
            )}
          </div>

          <div className="bg-[#161b22] p-8 rounded-xl border border-[#30363d]">
            <select required value={probId} onChange={e => {
                const pid = e.target.value;
                setProbId(pid);
                setProbName(dbProblems.find(x => x.id === pid)?.problem_title || "");
            }} className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3 outline-none focus:border-[#a371f7] text-sm mb-4 cursor-pointer">
                <option value="">SELECT PROBLEM ID</option>
                {dbProblems.filter(p => p.track_name === track).map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
            </select>
            <div className="text-lg font-bold text-white italic underline decoration-[#a371f7]/30">{probName || "---"}</div>
          </div>

          <button disabled={loading} className="w-full py-4 bg-[#a371f7] hover:bg-[#b388f9] disabled:opacity-50 text-white font-bold uppercase rounded-md shadow-lg transition-all tracking-widest">
             {loading ? "Registering..." : "Submit"}
          </button>
        </form>
      </div>
    </main>
  );
}