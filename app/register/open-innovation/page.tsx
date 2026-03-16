"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, UserPlus, ShieldAlert, CheckCircle2, ArrowLeft, Trash2, Phone } from "lucide-react";
import confetti from "canvas-confetti";

export default function OpenInnovationRegister() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1117]" />}>
      <OpenInnovationRegisterForm />
    </Suspense>
  );
}

function OpenInnovationRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ show: boolean; type: 'success' | 'denied'; message: string; id?: string }>({ 
    show: false, type: 'success', message: "" 
  });
  
  const [branches, setBranches] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);

  const [teamName, setTeamName] = useState("");
  const [oiEmail, setOiEmail] = useState("");
  const [oiProblemId, setOiProblemId] = useState("");
  const [oiProblemTitle, setOiProblemTitle] = useState("");
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
    }
    loadData();
  }, []);

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

  const validateOiSubmission = async (): Promise<{ valid: boolean; problemTitle: string }> => {
    const { data: oinnovationData, error } = await supabase
      .from("open_innovation_submissions")
      .select("problem_title")
      .eq("user_email", oiEmail)
      .eq("problem_id", oiProblemId)
      .single();

    if (error || !oinnovationData) {
      return { valid: false, problemTitle: "" };
    }

    return { valid: true, problemTitle: oinnovationData.problem_title };
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    
    if (!teamName || !oiEmail || !oiProblemId) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    // Validate Open Innovation email + problem_id
    const validation = await validateOiSubmission();
    
    if (!validation.valid) {
      setLoading(false);
      return setModal({
        show: true,
        type: 'denied',
        message: "Invalid email or problem ID. Please verify your submission details."
      });
    }

    setOiProblemTitle(validation.problemTitle);

    // 1. Process Members: Forced Uppercase & Generated Password
    const processedMembers = members.map(m => {
        const cleanReg = m.reg_number.trim().toUpperCase();
        const cleanPhone = m.phone.replace(/\D/g, '');
        const generatedPassword = cleanReg.slice(0, -1) + cleanPhone.slice(-5);

        return {
            ...m,
            reg_number: cleanReg,
            password: generatedPassword
        };
    });

    const regNums = processedMembers.map(m => m.reg_number);
    const emails = processedMembers.map(m => m.email);
    const leadEmail = processedMembers[0].email;

    // 2. Pre-emptive DB Check: Leader Email
    const { data: teamCheck } = await supabase
      .from("teams")
      .select("hackathon_id")
      .eq("lead_email", leadEmail)
      .single();

    if (teamCheck) {
      setLoading(false);
      return setModal({
        show: true, type: 'denied', 
        message: `The Leader email (${leadEmail}) is already assigned to a team.`,
        id: teamCheck.hackathon_id
      });
    }

    // 3. Pre-emptive DB Check: Member Duplicates
    const { data: existing } = await supabase
      .from("participants")
      .select("team_id, reg_number, email")
      .or(`reg_number.in.(${regNums.join(',')}),email.in.(${emails.join(',')})`);

    if (existing && existing.length > 0) {
      const { data: team } = await supabase.from("teams").select("hackathon_id").eq("id", existing[0].team_id).single();
      setLoading(false);
      return setModal({
        show: true, type: 'denied', 
        message: `Member ${existing[0].reg_number || existing[0].email} is already registered.`,
        id: team?.hackathon_id
      });
    }

    const genId = `TI26-${teamName.substring(0,3).toUpperCase()}-${Math.random().toString(36).substring(2,7).toUpperCase()}`;

    // 4. Save Team with Open Innovation
    const { data: team, error: tErr } = await supabase.from("teams").insert([{
      team_name: teamName.toUpperCase(), 
      hackathon_id: genId, 
      lead_email: leadEmail,
      track: "Open Innovation", 
      problem_id: oiProblemId, 
      problem_name: validation.problemTitle
    }]).select().single();

    if (tErr) { 
      console.error("Team creation error:", tErr);
      setLoading(false); 
      return setModal({ show: true, type: 'denied', message: `Team creation failed: ${tErr.message}` }); 
    }

    // 5. Save Participants with Generated Passwords
    const { error: pErr } = await supabase.from("participants").insert(
      processedMembers.map((m, i) => ({ team_id: team.id, ...m, is_leader: i === 0 }))
    );

    if (pErr) {
      await supabase.from("teams").delete().eq("id", team.id);
      setLoading(false);
      return setModal({ show: true, type: 'denied', message: "Submission Error" });
    }

    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#a371f7', '#ffffff'] });
    setModal({ show: true, type: 'success', message: cfg?.success_title || "Congratulations! You have Registered Successfully.", id: genId });
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0d1117] pt-32 pb-20 px-6 text-[#c9d1d9] font-sans">
      <Navbar />
      
      <AnimatePresence>
        {modal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0d1117]/90 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`max-w-md w-full p-8 rounded-2xl border ${modal.type === 'success' ? 'border-[#a371f7]/30 bg-[#161b22]' : 'border-red-500/30 bg-[#161b22]'} shadow-2xl text-center relative overflow-hidden`}>
              {modal.type === 'success' ? (
                <>
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#a371f7]" />
                  <CheckCircle2 size={48} className="text-[#a371f7] mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white uppercase mb-2 tracking-tighter italic">Congratulations!</h2>
                </>
              ) : (
                <>
                  <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white uppercase mb-2">Registration Failed</h2>
                </>
              )}
              <p className="text-[#8b949e] text-sm mb-6">{modal.message}</p>
              {modal.id && (
                <div className="bg-[#0d1117] border border-[#30363d] py-3 px-4 rounded-lg mb-6">
                  <p className="text-[10px] text-[#8b949e] uppercase tracking-widest mb-1">Your Hackathon Team ID</p>
                  <span className="text-[#a371f7] text-lg font-mono font-bold tracking-wider uppercase">{modal.id}</span>
                </div>
              )}
              <button onClick={() => modal.type === 'success' ? window.location.href = "/" : setModal({ ...modal, show: false })} className="w-full py-3 bg-[#30363d] hover:bg-[#444c56] text-white font-bold rounded-md transition-colors uppercase text-sm">
                {modal.type === 'success' ? "Return to Dashboard" : "OK"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        <Link href="/register" className="inline-flex items-center gap-2 text-[#8b949e] hover:text-[#a371f7] transition-colors mb-8 text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          <span>Back to Registration</span>
        </Link>

        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">Open Innovation <span className="text-[#a371f7]">Registration</span></h1>
        </header>
        
        <form onSubmit={handleRegister} className="space-y-8">
          {/* Team & OI Details Section */}
          <section className="bg-[#161b22] p-8 rounded-xl border border-[#30363d]">
            <h2 className="text-lg font-bold text-[#a371f7] uppercase mb-6 tracking-tight">Your Open Innovation Submission</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#8b949e] ml-1">Team Name</label>
                <input required placeholder="Enter Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3 outline-none focus:border-[#a371f7] transition-colors text-sm uppercase" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#8b949e] ml-1">Your Email</label>
                <input type="email" required placeholder="your@email.com" value={oiEmail} onChange={e => setOiEmail(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3 outline-none focus:border-[#a371f7] transition-colors text-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#8b949e] ml-1">Problem ID</label>
                <input type="text" required placeholder="e.g., OI-001" value={oiProblemId} onChange={e => setOiProblemId(e.target.value.toUpperCase())} className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3 outline-none focus:border-[#a371f7] transition-colors text-sm uppercase font-mono" />
              </div>

              {oiProblemTitle && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#8b949e] ml-1">Your Problem Title</label>
                  <div className="w-full bg-[#0d1117] border border-[#a371f7]/50 rounded-md px-4 py-3 text-sm text-[#a371f7] font-semibold">
                    {oiProblemTitle}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Team Members Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">Team Members</h2>
            <AnimatePresence initial={false}>
              {members.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="p-8 bg-[#161b22] border border-[#30363d] rounded-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#a371f7]" />
                  
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold text-[#a371f7] uppercase tracking-widest">
                      {i === 0 ? "Team Leader (Member 01)" : `Member 0${i+1}`}
                    </h3>
                    {i !== 0 && (
                      <button type="button" onClick={() => removeMember(i)} className="text-[#8b949e] hover:text-red-500 transition-colors p-1">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase">Full Name</label>
                        <input required value={m.name} onChange={e => handleUpdate(i, 'name', e.target.value)} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7]" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase">Branch</label>
                        <select required value={m.branch} onChange={e => handleUpdate(i, 'branch', e.target.value)} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7] appearance-none">
                            <option value="" className="bg-[#0d1117]">Select</option>
                            {branches.map(b => <option key={b} value={b} className="bg-[#0d1117]">{b}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase">Reg Number</label>
                        <input required value={m.reg_number} onChange={e => handleUpdate(i, 'reg_number', e.target.value)} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7] font-mono" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase">Year</label>
                        <select required value={m.year} onChange={e => handleUpdate(i, 'year', e.target.value)} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7] appearance-none">
                            <option value="" className="bg-[#0d1117]">Select</option>
                            {years.map(y => <option key={y} value={y} className="bg-[#0d1117]">{y}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase">Section</label>
                        <select required value={m.section} onChange={e => handleUpdate(i, 'section', e.target.value)} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7] appearance-none">
                            <option value="" className="bg-[#0d1117]">Select</option>
                            {sections.map(s => <option key={s} value={s} className="bg-[#0d1117]">{s}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase">Email</label>
                        <input type="email" required value={m.email} onChange={e => handleUpdate(i, 'email', e.target.value)} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7]" />
                    </div>

                    <div className="space-y-1 md:col-span-1">
                        <label className="text-[10px] text-[#8b949e] uppercase flex items-center gap-1"><Phone size={10}/> Mobile Number</label>
                        <input type="tel" required value={m.phone} onChange={e => handleUpdate(i, 'phone', e.target.value)} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7]" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {members.length < 4 && (
              <button 
                type="button" 
                onClick={() => setMembers([...members, { name: "", branch: "", section: "", year: "", reg_number: "", email: "", phone: "" }])} 
                className="w-full py-4 border border-dashed border-[#30363d] rounded-xl text-[#8b949e] hover:text-[#a371f7] hover:border-[#a371f7]/50 transition-all uppercase text-[10px] flex items-center justify-center gap-2 tracking-widest"
              >
                <UserPlus size={14} /> ADD MEMBERS
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="w-full py-4 bg-[#a371f7] hover:bg-[#b388f9] disabled:opacity-50 text-white font-bold uppercase rounded-md shadow-lg transition-all tracking-widest">
            {loading ? "Registering..." : "Register Team"}
          </button>
        </form>
      </div>
    </main>
  );
}
