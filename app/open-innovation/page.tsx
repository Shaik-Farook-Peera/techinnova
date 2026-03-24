"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Lightbulb, ArrowLeft, CheckCircle2, ShieldAlert, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OpenInnovation() {
  const [formData, setFormData] = useState({
    teamName: "",
    memberEmail: "",
    problemTitle: "",
    problemDescription: "",
    affectedAudience: "",
    aiSolution: "",
    measurableImpact: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [assignedProblemId, setAssignedProblemId] = useState<string>("");
  const [modal, setModal] = useState<{ show: boolean; type: 'duplicate' | 'error' | 'success'; message: string; id?: string; whatsappLink?: string; email?: string; problemId?: string }>({ 
    show: false, type: 'duplicate', message: "" 
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await supabase
        .from('site_config')
        .select('open_innovation_terms, own_idea_conditions')
        .single();
      if (data) setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const openInnovationRules = [
    "Students are strongly encouraged to propose their OWN problem statement beyond the listed ones.",
    "Your own idea must address a real-world problem faced by society, students, businesses, or communities.",
    "The proposed solution must use AI tools as the primary building approach — consistent with the hackathon theme.",
    "Own-idea proposals must be submitted to the organizing committee for pre-approval at least 48 hours before the event starts.",
    "Approved open-innovation teams compete in a special 'Open Innovation' category and are eligible for all prizes including the Grand Prize.",
    "Own-idea submissions must include a 1-page problem justification: What is the problem? Who does it affect? How will you use AI tools to build your solution? What is the measurable impact?",
    "Teams may also present their own idea LIVE to a panel before the hackathon starts to get early feedback and mentoring.",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const displayRules = config?.open_innovation_terms
    ? config.open_innovation_terms.split('\n').filter((line: string) => line.trim())
    : openInnovationRules;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToRules) {
      alert("Please agree to the rules before submitting.");
      return;
    }

    setLoading(true);

    try {
      // 🔐 CHECK IF EMAIL ALREADY HAS AN OPEN INNOVATION SUBMISSION
      const { data: existingSubmission, error: checkError } = await supabase
        .from('open_innovation_submissions')
        .select('problem_id, user_email')
        .eq('user_email', formData.memberEmail.trim().toLowerCase());

      if (checkError) throw checkError;

      if (existingSubmission && existingSubmission.length > 0) {
        setLoading(false);
        return setModal({
          show: true,
          type: 'duplicate',
          message: 'You have already registered with this email. Please verify your email or resend email again.',
          email: formData.memberEmail.trim().toLowerCase(),
          problemId: existingSubmission[0].problem_id
        });
      }

      // 🔐 CHECK IF EMAIL IS ALREADY IN PARTICIPANTS TABLE (other tracks)
      const { data: existingParticipant, error: participantError } = await supabase
        .from('participants')
        .select('email')
        .eq('email', formData.memberEmail.trim().toLowerCase());

      if (participantError) throw participantError;

      if (existingParticipant && existingParticipant.length > 0) {
        setLoading(false);
        return setModal({
          show: true,
          type: 'duplicate',
          message: 'You are already registered for another track. You can only register for one track.',
          email: formData.memberEmail.trim().toLowerCase()
        });
      }

      // Generate a unique problem_id for this submission
      const { count, error: countError } = await supabase
        .from('open_innovation_submissions')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      const problemId = `OI-${String((count || 0) + 1).padStart(3, '0')}`;

      // Save to Supabase with the generated problem_id
      const { data, error } = await supabase
        .from('open_innovation_submissions')
        .insert([
          {
            team_name: formData.teamName,
            user_email: formData.memberEmail.trim().toLowerCase(),
            problem_title: formData.problemTitle,
            problem_description: formData.problemDescription,
            affected_audience: formData.affectedAudience,
            ai_solution: formData.aiSolution,
            measurable_impact: formData.measurableImpact,
            status: 'pending',
            problem_id: problemId,
          }
        ]);

      if (error) {
        console.error("Error submitting idea:", error);
        setLoading(false);
        return setModal({
          show: true,
          type: 'error',
          message: 'Failed to submit. Please try again.'
        });
      }

      // Store email and problem_id in localStorage
      localStorage.setItem("userEmail", formData.memberEmail);
      localStorage.setItem("problemId", problemId);
      
      // Send email with problem ID
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.memberEmail,
            teamName: formData.teamName,
            problemId: problemId,
            problemTitle: formData.problemTitle,
          })
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
      
      setAssignedProblemId(problemId);
      setSubmitted(true);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setFormData({
          teamName: "",
          memberEmail: "",
          problemTitle: "",
          problemDescription: "",
          affectedAudience: "",
          aiSolution: "",
          measurableImpact: "",
        });
        setAgreedToRules(false);
        setSubmitted(false);
        setAssignedProblemId("");
      }, 5000);
    } catch (error) {
      console.error("Error submitting idea:", error);
      setLoading(false);
      setModal({
        show: true,
        type: 'error',
        message: 'An error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!modal.email) return;
    
    try {
      let emailHtml = '';
      
      if (modal.problemId) {
        // Open Innovation with Problem ID
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #c9d1d9; padding: 20px;">
            <div style="border-left: 4px solid #a371f7; padding-left: 20px; margin-bottom: 30px;">
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">Your Problem ID</h1>
              <p style="color: #8b949e; margin: 0;">Registration confirmation</p>
            </div>
            
            <div style="background-color: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #8b949e; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Problem ID</p>
              <div style="background-color: #0d1117; border: 2px solid #a371f7; padding: 20px; border-radius: 6px; text-align: center;">
                <p style="color: #a371f7; margin: 0; font-size: 32px; font-weight: bold; font-family: 'Courier New', monospace;">${modal.problemId}</p>
              </div>
            </div>
            
            <div style="text-align: center; color: #8b949e; font-size: 12px; border-top: 1px solid #30363d; padding-top: 20px;">
              <p style="margin: 0;">TECHINNOVA 2026</p>
              <p style="margin: 5px 0 0 0;">Keep this Problem ID safe for your records.</p>
            </div>
          </div>
        `;
      } else {
        // Cross-track registration confirmation
        emailHtml = `
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
      }
      
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: modal.email,
          teamName: 'Team',
          problemId: modal.problemId || 'N/A',
          subject: `Registration Confirmation - TECHINNOVA 2026`,
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
      
      // Success modal stays open until user closes
      
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
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9] pt-32 pb-20 px-6 font-sans">
      <Navbar />

      <AnimatePresence>
        {modal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0d1117]/90 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`max-w-md w-full p-8 rounded-2xl border ${modal.type === 'success' ? 'border-[#a371f7]/30 bg-[#161b22]' : 'border-red-500/30 bg-[#161b22]'} shadow-2xl text-center relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${modal.type === 'success' ? 'bg-[#a371f7]' : 'bg-red-500'}`} />
              {modal.type === 'success' ? (
                <CheckCircle2 size={48} className="text-[#a371f7] mx-auto mb-4" />
              ) : (
                <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
              )}
              <h2 className="text-xl font-bold text-white uppercase mb-2">{modal.type === 'success' ? 'Email Sent Successfully' : 'Already Registered'}</h2>
              <p className="text-[#8b949e] text-sm mb-6">{modal.message}</p>
              
              {modal.type === 'duplicate' && modal.problemId && (
                <div className="bg-[#0d1117] border border-[#30363d] py-3 px-4 rounded-lg mb-6">
                  <p className="text-[10px] text-[#8b949e] uppercase tracking-widest mb-1">Your Problem ID</p>
                  <span className="text-[#a371f7] text-lg font-mono font-bold tracking-wider">{modal.problemId}</span>
                </div>
              )}
              
              {modal.type === 'duplicate' && modal.email && (
                <div className="flex gap-3">
                  <button onClick={handleResendEmail} className="flex-1 py-3 bg-[#a371f7] hover:bg-[#b388f9] text-white font-bold rounded-md transition-colors uppercase text-sm flex items-center justify-center gap-2">
                    <Mail size={16} /> Resend Email
                  </button>
                  <button onClick={() => setModal({ ...modal, show: false })} className="flex-1 py-3 bg-[#30363d] hover:bg-[#444c56] text-white font-bold rounded-md transition-colors uppercase text-sm">
                    Close
                  </button>
                </div>
              )}
              
              {modal.type === 'duplicate' && !modal.email && (
                <button onClick={() => setModal({ ...modal, show: false })} className="w-full py-3 bg-[#30363d] hover:bg-[#444c56] text-white font-bold rounded-md transition-colors uppercase text-sm">
                  Close
                </button>
              )}
              
              {modal.type === 'error' && (
                <button onClick={() => setModal({ ...modal, show: false })} className="w-full py-3 bg-[#30363d] hover:bg-[#444c56] text-white font-bold rounded-md transition-colors uppercase text-sm">
                  OK
                </button>
              )}

              {modal.type === 'success' && (
                <button onClick={() => setModal({ ...modal, show: false })} className="w-full py-3 bg-[#30363d] hover:bg-[#444c56] text-white font-bold rounded-md transition-colors uppercase text-sm">
                  Close
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link href="/#tracks">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-[#8b949e] hover:text-[#a371f7] transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Tracks
          </motion.button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#a371f7]/10 rounded-lg">
              <Lightbulb size={24} className="text-[#a371f7]" />
            </div>
            <div>
              <span className="text-[#a371f7] font-mono text-[10px] font-bold uppercase tracking-widest block mb-1">
                <Terminal size={12} className="inline mr-1" />Open Innovation Category
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
                Submit Your Idea
              </h1>
            </div>
          </div>
          <p className="text-[#8b949e] text-lg max-w-3xl">
            Have a breakthrough idea to solve a real-world problem? Submit your own problem statement and build your solution using AI tools. Compete in the special Open Innovation category with a chance to win the Grand Prize!
          </p>
        </motion.div>

        {/* Rules Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 mb-12"
        >
          <h2 className="text-xl font-bold text-[#a371f7] uppercase mb-6 tracking-tight">Rules & Requirements</h2>
          <div className="space-y-4">
            {displayRules.map((rule: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className="flex gap-4 p-4 bg-[#0d1117] rounded-lg border border-[#30363d]/50 hover:border-[#a371f7]/30 transition-colors"
              >
                <span className="text-[#a371f7] font-bold text-lg flex-shrink-0 w-6">{index + 1}</span>
                <p className="text-[#8b949e] text-sm leading-relaxed">{rule}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Submission Form */}
        {!submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#161b22] border border-[#30363d] rounded-xl p-8"
          >
            <h2 className="text-xl font-bold text-white uppercase mb-8 tracking-tight flex items-center gap-2">
              <Terminal size={18} className="text-[#a371f7]" />
              Idea Submission Form
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Team Name */}
              <div>
                <label className="block text-[#a371f7] text-xs font-bold uppercase tracking-widest mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Innovation Squad"
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#a371f7] focus:ring-1 focus:ring-[#a371f7]/30 transition-all text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[#a371f7] text-xs font-bold uppercase tracking-widest mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="memberEmail"
                  value={formData.memberEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="team@example.com"
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#a371f7] focus:ring-1 focus:ring-[#a371f7]/30 transition-all text-sm"
                />
              </div>

              {/* Problem Title */}
              <div>
                <label className="block text-[#a371f7] text-xs font-bold uppercase tracking-widest mb-2">
                  Problem Title *
                </label>
                <input
                  type="text"
                  name="problemTitle"
                  value={formData.problemTitle}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Improving Student Mental Health Detection"
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#a371f7] focus:ring-1 focus:ring-[#a371f7]/30 transition-all text-sm"
                />
              </div>

              {/* Problem Description */}
              <div>
                <label className="block text-[#a371f7] text-xs font-bold uppercase tracking-widest mb-2">
                  What is the Problem? *
                </label>
                <textarea
                  name="problemDescription"
                  value={formData.problemDescription}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe the problem in detail. What pain points exist? Why is it important?"
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#a371f7] focus:ring-1 focus:ring-[#a371f7]/30 transition-all text-sm resize-none"
                />
              </div>

              {/* Affected Audience */}
              <div>
                <label className="block text-[#a371f7] text-xs font-bold uppercase tracking-widest mb-2">
                  Who Does It Affect? *
                </label>
                <textarea
                  name="affectedAudience"
                  value={formData.affectedAudience}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe the stakeholders: students, businesses, society, communities, etc."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#a371f7] focus:ring-1 focus:ring-[#a371f7]/30 transition-all text-sm resize-none"
                />
              </div>

              {/* AI Solution */}
              <div>
                <label className="block text-[#a371f7] text-xs font-bold uppercase tracking-widest mb-2">
                  How Will You Use AI Tools to Build Your Solution? *
                </label>
                <textarea
                  name="aiSolution"
                  value={formData.aiSolution}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe the AI tools, frameworks, and techniques you'll use to develop your prototype (e.g., TensorFlow, LLMs, Computer Vision, NLP, etc.)"
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#a371f7] focus:ring-1 focus:ring-[#a371f7]/30 transition-all text-sm resize-none"
                />
              </div>

              {/* Measurable Impact */}
              <div>
                <label className="block text-[#a371f7] text-xs font-bold uppercase tracking-widest mb-2">
                  What is the Measurable Impact? *
                </label>
                <textarea
                  name="measurableImpact"
                  value={formData.measurableImpact}
                  onChange={handleInputChange}
                  required
                  placeholder="Define success metrics. How will you measure if this solution works? (e.g., 30% reduction in XYZ, increased user engagement by 50%)"
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#a371f7] focus:ring-1 focus:ring-[#a371f7]/30 transition-all text-sm resize-none"
                />
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-center gap-3 p-4 bg-[#0d1117] border border-[#30363d] rounded-lg">
                <input
                  type="checkbox"
                  id="agreeRules"
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                  className="w-4 h-4 rounded border-[#30363d] bg-[#0d1117] cursor-pointer accent-[#a371f7]"
                />
                <label htmlFor="agreeRules" className="text-[#8b949e] text-xs cursor-pointer">
                  I have read and agree to all the Open Innovation rules and requirements
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-[#30363d]">
                <motion.button
                  whileHover={!loading && agreedToRules ? { scale: 1.02 } : {}}
                  whileTap={!loading && agreedToRules ? { scale: 0.98 } : {}}
                  disabled={loading || !agreedToRules}
                  type="submit"
                  className="w-full py-4 bg-[#a371f7] hover:bg-[#b388f9] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase rounded-lg transition-all text-sm tracking-widest"
                >
                  {loading ? "Submitting..." : "Submit Idea for Review"}
                </motion.button>
                <p className="text-[#8b949e] text-xs mt-3 text-center">
                  Submissions are reviewed by the organizing committee. You'll receive approval status within 24 hours.
                </p>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mb-6"
            >
              <CheckCircle2 size={48} className="text-[#a371f7]" />
            </motion.div>
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white uppercase mb-3">Submission Received!</h3>
            <p className="text-[#8b949e] mb-6">
              Thank you for your innovative idea! Our team will review your submission. Your problem ID has been sent to <span className="text-[#a371f7] font-semibold">{formData.memberEmail}</span>.
            </p>
            
            <p className="text-[#a371f7] font-semibold text-sm mb-8">
              Check your email for the problem ID. You'll need it along with your email to register your team once approved.
            </p>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-[#a371f7] hover:bg-[#b388f9] text-white font-bold rounded-lg transition-all text-sm uppercase tracking-widest"
              >
                Go to Registration
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
