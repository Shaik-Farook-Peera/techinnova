"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Terminal, AlertTriangle, CheckCircle2, Timer, Key } from "lucide-react";

export default function QuizPage() {
  const [config, setConfig] = useState({ live: false, duration: 30 });
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [quizStarted, setQuizStarted] = useState(false);
  const [chanceDone, setChanceDone] = useState(false); 
  
  const [timeLeft, setTimeLeft] = useState(1800); 
  const [regNo, setRegNo] = useState("");
  const [personalKey, setPersonalKey] = useState(""); 
  const [userData, setUserData] = useState({ name: "", teamId: "" });
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // 1. Fetching questions correctly to fix visibility issues
  useEffect(() => {
    async function fetchQuizData() {
      const { data: cfg } = await supabase.from('site_config').select('quiz_live, quiz_duration_minutes').single();
      
      // Pulling all columns ensuring option_a, option_b, etc. are loaded
      const { data: qs, error } = await supabase.from('quiz_questions').select('*');
      
      if (error) console.error("Question Fetch Error:", error.message);

      if (cfg) {
        setConfig({ live: cfg.quiz_live, duration: cfg.quiz_duration_minutes });
        setTimeLeft(cfg.quiz_duration_minutes * 60);
      }
      if (qs) setQuestions(qs);
      setLoading(false);
    }
    fetchQuizData();
  }, []);

  // 2. Anti-Cheating & One-Time Only Logic
  const submitQuiz = useCallback(async (violation = false) => {
    if (!quizStarted && !violation) return;

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) score += q.points || 1;
    });

    try {
      await supabase.from('quiz_submissions').insert([{
        student_name: userData.name,
        reg_no: regNo.trim().toUpperCase(), 
        team_id: userData.teamId,
        score: score,
        violation_detected: violation 
      }]);
      setChanceDone(true); 
      setQuizStarted(false);
    } catch (err) {
      console.error("Submission failed.");
    }
  }, [questions, answers, userData, regNo, quizStarted]);

  useEffect(() => {
    if (!quizStarted) return;
    const handleSecurityBreach = () => {
      if (document.visibilityState === "hidden") {
        alert("SECURITY BREACH: Window switch identified. Session terminated.");
        submitQuiz(true); 
      }
    };
    document.addEventListener("visibilitychange", handleSecurityBreach);
    return () => document.removeEventListener("visibilitychange", handleSecurityBreach);
  }, [quizStarted, submitQuiz]);

  useEffect(() => {
    if (!quizStarted || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    if (timeLeft === 0) submitQuiz(false);
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, submitQuiz]);

  // 3. User verification for single-attempt aim
  const initializeUser = async () => {
    const cleanRegNo = regNo.trim().toUpperCase();
    const cleanKey = personalKey.trim();

    if (!cleanRegNo || !cleanKey) return alert("All credentials required.");
    
    setLoading(true);

    // One-time exam check: See if they already exist in submissions
    const { data: existingEntry } = await supabase
      .from('quiz_submissions')
      .select('reg_no')
      .ilike('reg_no', cleanRegNo)
      .single();

    if (existingEntry) {
      setChanceDone(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('participants')
      .select('name, team_id')
      .ilike('reg_number', cleanRegNo)
      .eq('password', cleanKey)
      .single();

    if (error || !data) {
      alert("Authentication Failed: Invalid ID or Key.");
      setLoading(false);
      return;
    }

    setUserData({ name: data.name, teamId: data.team_id });
    setQuizStarted(true);
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-[white] font-mono animate-pulse">
      SYNCING MISSION DATA...
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9] select-none relative font-sans">
      <Navbar />
      <AnimatePresence mode="wait">
        {!config.live ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto pt-48 px-6 text-center">
            <div className="bg-[#161b22] border border-[#30363d] p-12 rounded-2xl">
              <Lock size={48} className="text-[#8b949e] mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white uppercase mb-2">Portal Locked</h2>
              <p className="text-[#8b949e] text-xs uppercase tracking-widest leading-relaxed">Evaluation mission is inactive.</p>
            </div>
          </motion.div>
        ) : chanceDone ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto pt-48 px-6 text-center">
            <div className="bg-[#161b22] border border-[#30363d] p-12 rounded-2xl shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              <AlertTriangle size={48} className="text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white uppercase mb-4 text-center">Attempt Denied</h2>
              <p className="text-[#8b949e] text-xs font-mono uppercase tracking-widest mb-8 leading-relaxed">This operative ID has already submitted or breached protocol.</p>
              <button onClick={() => window.location.href = "/"} className="w-full py-4 bg-[#30363d] hover:bg-[#444c56] text-white font-bold uppercase rounded-md text-xs">Return Dashboard</button>
            </div>
          </motion.div>
        ) : !quizStarted ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto pt-48 px-6">
            <div className="bg-[#161b22] border border-[#30363d] p-10 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#a371f7]" />
              <div className="flex items-center gap-3 justify-center mb-8">
                <Terminal size={24} className="text-[#a371f7]" />
                <h2 className="text-2xl font-bold text-white uppercase">Operative <span className="text-[#a371f7]">Login</span></h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Registration ID</label>
                  <input className="w-full bg-[#0d1117] border border-[#30363d] p-4 rounded-xl text-center text-white outline-none focus:border-[#a371f7] font-mono tracking-[0.2em]" placeholder="ID-NUMBER" value={regNo} onChange={e => setRegNo(e.target.value.toUpperCase())} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Operative Key</label>
                  <input type="password" className="w-full bg-[#0d1117] border border-[#30363d] p-4 rounded-xl text-center text-white outline-none focus:border-[#a371f7] font-mono tracking-[0.2em]" placeholder="SECRET KEY" value={personalKey} onChange={e => setPersonalKey(e.target.value)} />
                </div>
                <button onClick={initializeUser} className="w-full py-4 bg-[#a371f7] hover:bg-[#b388f9] text-white font-bold uppercase rounded-md text-xs tracking-widest">Authenticate</button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pt-32 pb-20 px-6">
            <div className="sticky top-24 z-50 mb-12 bg-[#161b22] border border-[#30363d] p-4 rounded-xl flex justify-between items-center shadow-2xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-[#a371f7]" size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e]">Operative: {userData.name}</span>
              </div>
              <div className={`flex items-center gap-2 font-mono font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-[#a371f7]'}`}>
                <Timer size={18} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="space-y-8 mb-12">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-[#161b22] border border-[#30363d] p-8 rounded-xl relative group">
                  <div className="flex items-start gap-4 mb-6">
                    <span className="text-[#a371f7] font-mono text-xs font-bold bg-[#a371f7]/10 border border-[#a371f7]/20 w-8 h-8 flex items-center justify-center rounded-md">{idx + 1}</span>
                    {/* Fixed Question Text Visibility */}
                    <h3 className="text-lg font-bold text-white">{q.question_text}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, i) => {
                      const letter = ['a', 'b', 'c', 'd'][i];
                      const isSelected = answers[q.id] === letter;
                      return (
                        <button key={letter} onClick={() => setAnswers({...answers, [q.id]: letter})} className={`p-4 rounded-lg border text-left text-sm transition-all flex items-center gap-3 ${isSelected ? 'bg-[#a371f7]/10 border-[#a371f7] text-white shadow-md' : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#444c56]'}`}>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#a371f7] bg-[#a371f7]' : 'border-[#30363d]'}`}>
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => submitQuiz(false)} className="w-full py-5 bg-[#a371f7] hover:bg-[#b388f9] text-white font-bold uppercase rounded-md shadow-xl text-xs tracking-widest">
               Finalize Transmission
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}