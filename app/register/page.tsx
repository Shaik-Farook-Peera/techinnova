"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation"; 
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, UserPlus, ShieldAlert, CheckCircle2, ArrowLeft, Cpu, Trash2, Phone, Mail } from "lucide-react";
import confetti from "canvas-confetti";

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d1117]" />}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialTrack = searchParams.get("track") || "";
  const initialProbId = searchParams.get("probId") || "";

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ show: boolean; type: 'success' | 'denied' | 'duplicate' | 'error'; message: string; id?: string; whatsappLink?: string; email?: string }>({ 
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

  // Initializing with 'phone' field
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

      const { data: problemsData } = await supabase
        .from('problem_statements')
        .select('id, track_name, problem_title');
      
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
    // Force Register Number to Uppercase while typing
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
    
    // Validate track/problem selection
    if (!track) {
      alert("Please select a track");
      return;
    }

    if (!probId) {
      alert("Please select a problem");
      return;
    }

    setLoading(true);

    // 🔐 VALIDATE: Problem ID + Lead Email must exist in open_innovation table
    const leadEmail = members[0].email;
    
    if (!leadEmail) {
      setLoading(false);
      alert("Please enter the leader's email");
      return;
    }

    const { data: oiRecord, error: oiError } = await supabase
      .from("open_innovation")
      .select("*")
      .eq("problem_id", probId)
      .eq("email", leadEmail)
      .single();

    if (!oiRecord) {
      setLoading(false);
      return setModal({
        show: true, 
        type: 'denied', 
        message: `Invalid Problem ID or Email combination. The Problem ID (${probId}) must match the email (${leadEmail}) from your Open Innovation submission.`
      });
    }

    // 1. Process Members: Forced Uppercase & Generated Password
    const processedMembers = members.map(m => {
        const cleanReg = m.reg_number.trim().toUpperCase();
        const cleanPhone = m.phone.replace(/\D/g, ''); // Extract only digits
        
        // Pattern: RegNo (minus last digit) + Phone (last 5 digits)
        const generatedPassword = cleanReg.slice(0, -1) + cleanPhone.slice(-5);

        return {
            ...m,
            reg_number: cleanReg,
            password: generatedPassword
        };
    });

    const regNums = processedMembers.map(m => m.reg_number);
    const emails = processedMembers.map(m => m.email);

    // 🔐 CHECK IF ANY EMAIL EXISTS IN PARTICIPANTS TABLE
    const { data: existingParticipants } = await supabase
      .from("participants")
      .select("email")
      .in("email", emails);

    if (existingParticipants && existingParticipants.length > 0) {
      setLoading(false);
      return setModal({
        show: true, 
        type: 'denied', 
        message: `You are already registered with this email.`,
        email: leadEmail
      });
    }

    // 🔐 CHECK IF ANY EMAIL EXISTS IN OPEN_INNOVATION TABLE
    const { data: existingOI } = await supabase
      .from("open_innovation")
      .select("email")
      .in("email", emails);

    if (existingOI && existingOI.length > 0) {
      setLoading(false);
      return setModal({
        show: true, 
        type: 'denied', 
        message: `You are already registered with this email.`,
        email: leadEmail
      });
    }

    // 2. Pre-emptive DB Check: Leader Email (check if already registered in teams table)
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

    // 4. Save Team
    const { data: team, error: tErr } = await supabase.from("teams").insert([{
      team_name: teamName.toUpperCase(), 
      hackathon_id: genId, 
      lead_email: leadEmail,
      track, 
      problem_id: probId, 
      problem_name: probName
    }]).select().single();

    if (tErr) { setLoading(false); return setModal({ show: true, type: 'denied', message: "" }); }

    // 5. Save Participants with Generated Passwords
    const { error: pErr } = await supabase.from("participants").insert(
      processedMembers.map((m, i) => ({ team_id: team.id, ...m, is_leader: i === 0 }))
    );

    if (pErr) {
      await supabase.from("teams").delete().eq("id", team.id);
      setLoading(false);
      return setModal({ show: true, type: 'denied', message: "Submission Error" });
    }

    // 6. Send Team Registration Email
    try {
      const membersHtml = processedMembers.map((m, i) => `
        <tr style="border-bottom: 1px solid #30363d;">
          <td style="padding: 12px; color: #c9d1d9; font-size: 13px;">${i + 1}</td>
          <td style="padding: 12px; color: #c9d1d9; font-size: 13px;">${m.name}</td>
          <td style="padding: 12px; color: #c9d1d9; font-size: 13px;">${m.reg_number}</td>
          <td style="padding: 12px; color: #c9d1d9; font-size: 13px;">${m.email}</td>
          <td style="padding: 12px; color: #c9d1d9; font-size: 13px;">${m.branch}</td>
          <td style="padding: 12px; color: #c9d1d9; font-size: 13px;">${m.year}</td>
        </tr>
      `).join('');

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #0d1117; color: #c9d1d9; padding: 20px;">
          <div style="border-left: 4px solid #a371f7; padding-left: 20px; margin-bottom: 30px;">
            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">Team Registration Confirmed</h1>
            <p style="color: #8b949e; margin: 0;">Your team has been successfully registered for TECHINNOVA 2026</p>
          </div>

          <div style="background-color: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #a371f7; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Team Information</h3>
            
            <p style="color: #8b949e; margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Team Name</p>
            <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">${teamName.toUpperCase()}</p>

            <p style="color: #8b949e; margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Team ID</p>
            <div style="background-color: #0d1117; border: 2px solid #a371f7; padding: 12px; border-radius: 6px; text-align: center; margin-bottom: 15px;">
              <p style="color: #a371f7; margin: 0; font-size: 24px; font-weight: bold; font-family: 'Courier New', monospace;">${genId}</p>
            </div>

            <p style="color: #8b949e; margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Track</p>
            <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px;">${track}</p>

            <p style="color: #8b949e; margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Problem ID</p>
            <p style="color: #58a6ff; margin: 0 0 15px 0; font-size: 14px; font-weight: bold;">${probId}</p>

            <p style="color: #8b949e; margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Problem Title</p>
            <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px;">${probName}</p>
          </div>

          <div style="background-color: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #a371f7; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Team Members</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="border-bottom: 2px solid #a371f7;">
                  <th style="padding: 12px; text-align: left; color: #a371f7; font-weight: bold;">S.No</th>
                  <th style="padding: 12px; text-align: left; color: #a371f7; font-weight: bold;">Name</th>
                  <th style="padding: 12px; text-align: left; color: #a371f7; font-weight: bold;">Reg No</th>
                  <th style="padding: 12px; text-align: left; color: #a371f7; font-weight: bold;">Email</th>
                  <th style="padding: 12px; text-align: left; color: #a371f7; font-weight: bold;">Branch</th>
                  <th style="padding: 12px; text-align: left; color: #a371f7; font-weight: bold;">Year</th>
                </tr>
              </thead>
              <tbody>
                ${membersHtml}
              </tbody>
            </table>
          </div>

          <div style="background-color: #0d1117; border-left: 2px solid #a371f7; padding: 15px; margin-bottom: 20px;">
            <p style="color: #58a6ff; margin: 0; font-size: 12px;">
              <strong>Important:</strong> Save your Team ID (${genId}). You'll need it for future communications and event updates.
            </p>
          </div>

          <div style="text-align: center; background-color: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #a371f7; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Join Our Community</h3>
            <p style="color: #8b949e; margin: 0 0 15px 0; font-size: 12px;">Connect with other teams, share ideas, and get updates!</p>
            <a href="https://chat.whatsapp.com/ERfEJDVX6zAJT5iLXijkHQ?mode=gi_t" style="display: inline-block; background-color: #25d366; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; transition: background-color 0.3s;">Join WhatsApp Group</a>
          </div>

          <div style="text-align: center; color: #8b949e; font-size: 12px; border-top: 1px solid #30363d; padding-top: 20px;">
            <p style="margin: 0;">TECHINNOVA 2026 - Team Registration Confirmed</p>
            <p style="margin: 5px 0 0 0;">Good luck with your hackathon journey!</p>
          </div>
        </div>
      `;

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadEmail,
          teamName,
          problemId: probId,
          subject: `Team Registration Confirmed: ${genId}`,
          htmlContent: emailContent,
          isTeamRegistration: true
        })
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't block registration if email fails
    }

    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#a371f7', '#ffffff'] });
    setModal({ show: true, type: 'success', message: cfg?.success_title || "Congratulations! You have Registered Successful.", id: genId, whatsappLink: "https://chat.whatsapp.com/ERfEJDVX6zAJT5iLXijkHQ?mode=gi_t" });
    setLoading(false);
  };

  const handleResendEmail = async () => {
    if (!modal.email) return;
    
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #c9d1d9; padding: 20px;">
          <div style="border-left: 4px solid #a371f7; padding-left: 20px; margin-bottom: 30px;">
            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">Registration Confirmation</h1>
            <p style="color: #8b949e; margin: 0;">TECHINNOVA 2026</p>
          </div>
          
          <div style="background-color: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #8b949e; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</p>
            <p style="color: #ffffff; margin: 0 0 20px 0; font-size: 14px;">${modal.email}</p>
          </div>
          
          <div style="text-align: center; color: #8b949e; font-size: 12px; border-top: 1px solid #30363d; padding-top: 20px;">
            <p style="margin: 0;">TECHINNOVA 2026</p>
            <p style="margin: 5px 0 0 0;">If you have any questions, contact the organizing committee.</p>
          </div>
        </div>
      `;
      
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: modal.email,
          teamName,
          problemId: probId,
          subject: `Team Registration Confirmation - TECHINNOVA 2026`,
          htmlContent: emailHtml,
          isTeamRegistration: true
        })
      });
      
      // Show success modal instead of alert
      setModal({
        show: true,
        type: 'success',
        message: 'Email sent successfully to ' + modal.email
      });
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        setModal({ show: false, type: 'duplicate', message: "" });
      }, 2000);
      
    } catch (error) {
      console.error('Error resending email:', error);
      setModal({
        show: true,
        type: 'error',
        message: 'Failed to resend email.'
      });
    }
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
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white uppercase mb-2 tracking-tighter italic">Congratulations!</h2>
                </>
              ) : (
                <>
                  <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white uppercase mb-2">Already Registered</h2>
                </>
              )}
              <p className="text-[#8b949e] text-sm mb-6">{modal.message}</p>
              {modal.id && (
                <div className="bg-[#0d1117] border border-[#30363d] py-3 px-4 rounded-lg mb-6">
                  <p className="text-[10px] text-[#8b949e] uppercase tracking-widest mb-1">Your Hackathon Team ID</p>
                  <span className="text-[#a371f7] text-lg font-mono font-bold tracking-wider uppercase">{modal.id}</span>
                </div>
              )}
              {modal.type === 'success' && modal.whatsappLink && (
                <a href={modal.whatsappLink} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-[#25d366] hover:bg-[#1d9e4d] text-white font-bold rounded-md transition-colors uppercase text-sm mb-3 text-center">
                  Join WhatsApp Group
                </a>
              )}
              {modal.type === 'denied' && modal.email && (
                <div className="flex gap-3">
                  <button onClick={handleResendEmail} className="flex-1 py-3 bg-[#a371f7] hover:bg-[#b388f9] text-white font-bold rounded-md transition-colors uppercase text-sm flex items-center justify-center gap-2">
                    <Mail size={16} /> Resend Email
                  </button>
                  <button onClick={() => setModal({ ...modal, show: false })} className="flex-1 py-3 bg-[#30363d] hover:bg-[#444c56] text-white font-bold rounded-md transition-colors uppercase text-sm">
                    Close
                  </button>
                </div>
              )}
              {modal.type === 'denied' && !modal.email && (
                <button onClick={() => setModal({ ...modal, show: false })} className="w-full py-3 bg-[#30363d] hover:bg-[#444c56] text-white font-bold rounded-md transition-colors uppercase text-sm">
                  OK
                </button>
              )}
              {modal.type === 'error' && (
                <button onClick={() => setModal({ ...modal, show: false })} className="w-full py-3 bg-[#30363d] hover:bg-[#444c56] text-white font-bold rounded-md transition-colors uppercase text-sm">
                  OK
                </button>
              )}
              {modal.type === 'success' && (
                <button onClick={() => modal.id ? window.location.href = "/" : setModal({ ...modal, show: false })} className="w-full py-3 bg-[#30363d] hover:bg-[#444c56] text-white font-bold rounded-md transition-colors uppercase text-sm">
                  {modal.id ? 'Return to Dashboard' : 'Close'}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[#8b949e] hover:text-[#a371f7] transition-colors mb-8 text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          <span>Dashboard</span>
        </Link>

        <header className="mb-12">
    
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">Team <span className="text-[#a371f7]">Registration</span></h1>
        </header>
        
        <form onSubmit={handleRegister} className="space-y-8">
          <section className="bg-[#161b22] p-8 rounded-xl border border-[#30363d]">
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#8b949e] ml-1">Team Name</label>
                  <input required placeholder="Enter Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3 outline-none focus:border-[#a371f7] transition-colors text-sm uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#8b949e] ml-1">Select Track</label>
                  <select 
                    required 
                    value={track} 
                    onChange={e => {
                      const selectedTrack = e.target.value;
                      if (selectedTrack === "Open Innovation") {
                        // Redirect to separate Open Innovation registration page
                        setTimeout(() => {
                          window.location.href = "/register/open-innovation";
                        }, 0);
                        return;
                      }
                      setTrack(selectedTrack); 
                      setProbId("");     
                      setProbName("");
                    }} 
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3 outline-none focus:border-[#a371f7] transition-colors text-sm appearance-none cursor-pointer"
                  >
                    <option value="">Select Track</option>
                    {availableTracks.map(t => <option key={t} value={t}>{t}</option>)}
                    <option value="Open Innovation">Open Innovation (Separate Page)</option>
                  </select>
                </div>
             </div>
          </section>

          <div className="space-y-4">
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

          <div className="bg-[#161b22] p-8 rounded-xl border border-[#30363d]">
            <div className="w-full md:w-1/3">
              <label className="text-[10px] font-bold text-[#8b949e] uppercase mb-2 block">Problem ID</label>
              <select 
                required 
                value={probId} 
                onChange={e => {
                  const pid = e.target.value;
                  setProbId(pid);
                  const p = dbProblems.find(x => x.id === pid);
                  setProbName(p?.problem_title || "");
                }} 
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3 text-white outline-none focus:border-[#a371f7] transition-colors text-sm appearance-none cursor-pointer"
              >
                <option value="">Select ID</option>
                {dbProblems.filter(p => p.track_name === track).map(p => (
                  <option key={p.id} value={p.id}>{p.id}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 mt-6 md:mt-0">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-[10px] font-bold text-[#8b949e] uppercase">Problem Title</label>
              </div>
              <div className="text-lg font-bold text-white leading-tight underline decoration-[#a371f7]/30 min-h-[3rem]">
                {probName || "---"}
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-[#a371f7] hover:bg-[#b388f9] disabled:opacity-50 text-white font-bold uppercase rounded-md shadow-lg transition-all tracking-widest">
            {loading ? "Registering..." : "Submit"}
          </button>
        </form>
      </div>
    </main>
  );
}