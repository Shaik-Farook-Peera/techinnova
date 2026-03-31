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
  const [showApprovalBanner, setShowApprovalBanner] = useState(false);
  const [approvalEmail, setApprovalEmail] = useState("");
const [modal, setModal] = useState<{ show: boolean; type: 'success' | 'denied' | 'error'; message: string; id?: string; whatsappLink?: string; email?: string }>({
    show: false, type: 'success', message: "" 
  });
  
  const [branches, setBranches] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);

  const [teamName, setTeamName] = useState("");
  const [oiEmail, setOiEmail] = useState("");
  const [oiProblemId, setOiProblemId] = useState("");
  const [oiProblemTitle, setOiProblemTitle] = useState("");
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [cfg, setCfg] = useState<any>(null);
  
  // Check Email functionality states
  const [checkEmailMode, setCheckEmailMode] = useState(false); // Start with REGISTRATION FORM (primary purpose)
  const [existingTeamData, setExistingTeamData] = useState<any>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailNotFound, setEmailNotFound] = useState(false);

  const [members, setMembers] = useState([
    { name: "", college_name: "", branch: "", section: "", year: "", reg_number: "", email: "", phone: "" },
    { name: "", college_name: "", branch: "", section: "", year: "", reg_number: "", email: "", phone: "" }
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

      // Check if email parameter exists in URL (from email button link)
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('email');
      
      if (emailParam) {
        // Auto-load submission data for this email
        try {
          const trimmedEmail = emailParam.trim().toLowerCase();
          const { data: submission } = await supabase
            .from("open_innovation_submissions")
            .select("problem_id, problem_title, team_name, user_email")
            .eq("user_email", trimmedEmail)
            .single();

          if (submission) {
            // Found in OI submissions - auto-load the data
            setOiEmail(trimmedEmail);
            setTeamName(submission.team_name);
            setOiProblemId(submission.problem_id);
            setOiProblemTitle(submission.problem_title);
            setSubmissionError("");
            
            // Auto-fill Member 1 email
            const updatedMembers = [...members];
            updatedMembers[0] = { ...updatedMembers[0], email: submission.user_email || trimmedEmail };
            setMembers(updatedMembers);
            
            // Show approval banner
            setApprovalEmail(trimmedEmail);
            setShowApprovalBanner(true);
          }
        } catch (error) {
          console.error('Error loading submission from URL param:', error);
        }
      }
    }
    loadData();
  }, []);

  const handleUpdate = (idx: number, field: string, val: string) => {
    const next = [...members];
    if (field === 'reg_number') {
        (next[idx] as any)[field] = val.toUpperCase();
    } else if (field === 'phone') {
        // Only allow numbers for phone field, max 10 digits
        (next[idx] as any)[field] = val.replace(/\D/g, '').slice(0, 10);
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

  const loadSubmissionData = async (email: string) => {
    if (!email.trim()) {
      setTeamName("");
      setOiProblemId("");
      setOiProblemTitle("");
      setSubmissionError("");
      // Clear member 1 email when input is cleared
      const updatedMembers = [...members];
      updatedMembers[0] = { ...updatedMembers[0], email: "" };
      setMembers(updatedMembers);
      return;
    }

    setLoadingSubmission(true);
    setSubmissionError("");
    const trimmedEmail = email.trim().toLowerCase();
    
    // 1. Check if email is in Open Innovation submissions
    const { data: submission, error } = await supabase
      .from("open_innovation_submissions")
      .select("problem_id, problem_title, team_name, user_email")
      .eq("user_email", trimmedEmail)
      .single();

    if (error || !submission) {
      // Not in OI submissions, check if they're registered in another track
      const { data: existingParticipant } = await supabase
        .from("participants")
        .select("email, team_id")
        .eq("email", trimmedEmail)
        .single();

      if (existingParticipant) {
        // User is registered in another track
        setSubmissionError("You have already registered in another track. You cannot register in multiple tracks. Please contact the organizing committee if you need assistance.");
      } else {
        // User is not registered anywhere
        setSubmissionError("You have not registered in Open Innovation yet. Please register your Open Innovation problem first.");
      }
      
      setTeamName("");
      setOiProblemId("");
      setOiProblemTitle("");
      // Clear member 1 email if submission not found
      const updatedMembers = [...members];
      updatedMembers[0] = { ...updatedMembers[0], email: "" };
      setMembers(updatedMembers);
    } else {
      // Found in OI submissions - load the data
      setTeamName(submission.team_name);
      setOiProblemId(submission.problem_id);
      setOiProblemTitle(submission.problem_title);
      setSubmissionError("");
      // Auto-fill Member 1 (Team Lead) with their OI registration email
      const updatedMembers = [...members];
      updatedMembers[0] = { ...updatedMembers[0], email: submission.user_email || trimmedEmail };
      setMembers(updatedMembers);

      // Show approval banner on page
      setApprovalEmail(trimmedEmail);
      setShowApprovalBanner(true);

      // Send approval email with team registration link
      try {
        const registrationLink = `https://techinnova-2k26.vercel.app/register/open-innovation?email=${encodeURIComponent(trimmedEmail)}`;
        const approvalEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1117; color: #c9d1d9; padding: 20px;">
            <div style="border-left: 4px solid #a371f7; padding-left: 20px; margin-bottom: 30px;">
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">✅ Your Idea is Approved!</h1>
              <p style="color: #8b949e; margin: 0;">Your Open Innovation submission has been approved</p>
            </div>

            <div style="background-color: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #8b949e; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Team Name</p>
              <p style="color: #ffffff; margin: 0 0 20px 0; font-size: 16px; font-weight: bold;">${submission.team_name}</p>

              <p style="color: #8b949e; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Problem Title</p>
              <p style="color: #ffffff; margin: 0 0 20px 0; font-size: 16px;">${submission.problem_title}</p>

              <div style="background-color: #0d1117; border: 2px solid #a371f7; padding: 20px; border-radius: 6px; text-align: center;">
                <p style="color: #8b949e; margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Your Problem ID</p>
                <p style="color: #a371f7; margin: 0; font-size: 32px; font-weight: bold; font-family: 'Courier New', monospace;">${submission.problem_id}</p>
              </div>
            </div>

            <div style="background-color: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <h3 style="color: #a371f7; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Next Step: Register Your Team</h3>
              <p style="color: #8b949e; margin: 0 0 25px 0; font-size: 13px;">Your Open Innovation idea has been confirmed. Now proceed to register your team with team members and submit your complete team details.</p>
              
              <table style="margin: 0 auto; border-collapse: collapse;">
                <tr>
                  <td style="background-color: #a371f7; color: #ffffff; padding: 16px 40px; border-radius: 6px; border: 2px solid #a371f7; text-align: center;">
                    <a href="${registrationLink}" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 15px; font-family: Arial, sans-serif; display: inline-block; background-color: #a371f7; padding: 16px 40px; border-radius: 6px;">
                      Complete Team Registration →
                    </a>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background-color: #0d1117; border-left: 2px solid #a371f7; padding: 15px; margin-bottom: 20px;">
              <p style="color: #58a6ff; margin: 0; font-size: 12px;">
                <strong>Important:</strong> Use this email (${trimmedEmail}) and your Problem ID (${submission.problem_id}) to register your team. Keep this email for your records.
              </p>
            </div>

            <div style="background-color: #161b22; border: 1px solid #30363d; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="color: #a371f7; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">What To Do Next</h4>
              <ol style="color: #8b949e; margin: 0; padding-left: 20px; line-height: 1.8; font-size: 12px;">
                <li style="margin-bottom: 8px;">Click the button above to go to team registration form</li>
                <li style="margin-bottom: 8px;">Enter your team members' details (up to 4 members)</li>
                <li style="margin-bottom: 8px;">Fill in all required fields with valid 10-digit mobile numbers</li>
                <li>Submit your team registration</li>
              </ol>
            </div>

            <div style="text-align: center; color: #8b949e; font-size: 12px; border-top: 1px solid #30363d; padding-top: 20px;">
              <p style="margin: 0;">TECHINNOVA 2026 - Open Innovation Category</p>
              <p style="margin: 5px 0 0 0;">Questions? Contact the organizing committee at techinnova2k26@gmail.com</p>
            </div>
          </div>
        `;

        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmedEmail,
            teamName: submission.team_name,
            problemId: submission.problem_id,
            problemTitle: submission.problem_title,
            subject: `🎉 Your Open Innovation Idea is Approved - ${submission.problem_id}`,
            htmlContent: approvalEmailHtml,
            isTeamRegistration: false
          })
        });
      } catch (emailError) {
        console.error('Error sending approval email:', emailError);
      }
    }
    setLoadingSubmission(false);
  };

  const handleResendEmail = async () => {
    if (!modal.email) return;
    
    try {
      // 1. Find the participant with this email to get team_id
      const { data: emailParticipant }: any = await supabase
        .from("participants")
        .select("team_id")
        .eq("email", modal.email)
        .single();

      if (!emailParticipant) {
        setModal({
          show: true,
          type: 'error',
          message: 'Could not find registration data for this email.'
        });
        return;
      }

      // 2. Fetch ALL team members with this team_id
      const { data: allTeamMembers }: any = await supabase
        .from("participants")
        .select("team_id, name, reg_number, email, branch, year")
        .eq("team_id", emailParticipant.team_id);

      if (!allTeamMembers || allTeamMembers.length === 0) {
        setModal({
          show: true,
          type: 'error',
          message: 'Could not find team members.'
        });
        return;
      }

      // 3. Get team information
      const { data: team }: any = await supabase
        .from("teams")
        .select("team_name, track, problem_id, problem_name")
        .eq("id", emailParticipant.team_id)
        .single();

      if (!team) {
        setModal({
          show: true,
          type: 'error',
          message: 'Could not find team information.'
        });
        return;
      }

      // 4. Build members table HTML from ALL team members
      const membersHtml = allTeamMembers.map((m: any, i: number) => `
        <tr style="border-bottom: 1px solid #30363d;">
          <td style="padding: 8px; color: #c9d1d9; font-size: 11px; word-break: break-word;">${i + 1}</td>
          <td style="padding: 8px; color: #c9d1d9; font-size: 11px; word-break: break-word;">${m.name}</td>
          <td style="padding: 8px; color: #c9d1d9; font-size: 11px; word-break: break-word;">${m.reg_number}</td>
          <td style="padding: 8px; color: #c9d1d9; font-size: 10px; word-break: break-all;">${m.email}</td>
          <td style="padding: 8px; color: #c9d1d9; font-size: 11px; word-break: break-word;">${m.college_name}</td>
          <td style="padding: 8px; color: #c9d1d9; font-size: 11px; word-break: break-word;">${m.branch}</td>
          <td style="padding: 8px; color: #c9d1d9; font-size: 11px; word-break: break-word;">${m.year}</td>
        </tr>
      `).join('');

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #0d1117; color: #c9d1d9; padding: 20px;">
          <div style="border-left: 4px solid #a371f7; padding-left: 20px; margin-bottom: 30px;">
            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">⚠️ Registration Already Exists</h1>
            <p style="color: #8b949e; margin: 0;">You are already registered with this email for TECHINNOVA 2026 - Open Innovation</p>
          </div>

          <div style="background-color: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #a371f7; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Registration Details</h3>
            
            <p style="color: #8b949e; margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Team Name</p>
            <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">${team.team_name?.toUpperCase() || ''}</p>

            <p style="color: #8b949e; margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Track</p>
            <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px;">Open Innovation</p>

            <p style="color: #8b949e; margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Problem ID</p>
            <p style="color: #58a6ff; margin: 0 0 15px 0; font-size: 14px; font-weight: bold;">${team.problem_id || ''}</p>

            <p style="color: #8b949e; margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Problem Title</p>
            <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px;">${team.problem_name || ''}</p>
          </div>

          <div style="background-color: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #a371f7; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Team Members</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; overflow-wrap: break-word;">
              <thead>
                <tr style="border-bottom: 2px solid #a371f7;">
                  <th style="padding: 8px; text-align: left; color: #a371f7; font-weight: bold; font-size: 11px;">S.No</th>
                  <th style="padding: 8px; text-align: left; color: #a371f7; font-weight: bold; font-size: 11px;">Name</th>
                  <th style="padding: 8px; text-align: left; color: #a371f7; font-weight: bold; font-size: 11px;">Reg No</th>
                  <th style="padding: 8px; text-align: left; color: #a371f7; font-weight: bold; font-size: 11px;">Email</th>
                  <th style="padding: 8px; text-align: left; color: #a371f7; font-weight: bold; font-size: 11px;">College</th>
                  <th style="padding: 8px; text-align: left; color: #a371f7; font-weight: bold; font-size: 11px;">Branch</th>
                  <th style="padding: 8px; text-align: left; color: #a371f7; font-weight: bold; font-size: 11px;">Year</th>
                </tr>
              </thead>
              <tbody>
                ${membersHtml}
              </tbody>
            </table>
          </div>

          <div style="background-color: #0d1117; border-left: 2px solid #ffa500; padding: 15px; margin-bottom: 20px;">
            <p style="color: #ffa500; margin: 0; font-size: 12px;">
              <strong>Note:</strong> This email is sent because you attempted to register with an email that is already associated with a team. If you have any questions about your registration, please contact the organizing committee.
            </p>
          </div>

          <div style="text-align: center; color: #8b949e; font-size: 12px; border-top: 1px solid #30363d; padding-top: 20px;">
            <p style="margin: 0;">TECHINNOVA 2026 - Open Innovation</p>
            <p style="margin: 5px 0 0 0;">Let's innovate together!</p>
          </div>
        </div>
      `;
      
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: modal.email,
          teamName: team.team_name,
          problemId: team.problem_id,
          problemTitle: team.problem_name,
          subject: `Your Registration Information - TECHINNOVA 2026 Open Innovation`,
          htmlContent: emailHtml,
          isTeamRegistration: true
        })
      });
      
      setModal({
        show: true,
        type: 'success',
        message: 'Email sent successfully to ' + modal.email
      });
      
    } catch (error) {
      console.error('Error resending email:', error);
      setModal({
        show: true,
        type: 'error',
        message: 'Failed to resend email.'
      });
    }
  };

  const checkExistingEmail = async () => {
    if (!oiEmail.trim()) {
      setModal({
        show: true,
        type: 'error',
        message: 'Please enter an email address.'
      });
      return;
    }

    setCheckingEmail(true);
    try {
      const trimmedEmail = oiEmail.trim().toLowerCase();

      // Search for email in participants table
      const { data: participant, error: pError }: any = await supabase
        .from("participants")
        .select("team_id, name, reg_number, email, branch, year")
        .eq("email", trimmedEmail)
        .single();

      if (!participant) {
        // Email not found - show registration prompt
        setCheckEmailMode(true);
        setExistingTeamData(null);
        setEmailNotFound(true);
        return;
      }

      // Email found - fetch team details
      const { data: teamData, error: tError }: any = await supabase
        .from("teams")
        .select("id, team_name, track, problem_id, problem_name")
        .eq("id", participant?.team_id)
        .single();

      if (teamData) {
        setCheckEmailMode(true);
        setExistingTeamData({
          participant,
          team: teamData,
          isFound: true
        });
        setEmailNotFound(false);
      }
    } catch (error) {
      console.error('Error checking email:', error);
      // If error (email not found), show registration prompt
      setCheckEmailMode(true);
      setExistingTeamData(null);
      setEmailNotFound(true);
    } finally {
      setCheckingEmail(false);
    }
  };

  const startNewRegistration = () => {
    setCheckEmailMode(false);
    setExistingTeamData(null);
    setEmailNotFound(false);
    // Keep oiEmail preserved so user doesn't have to re-enter it
    setTeamName("");
    setOiProblemId("");
    setOiProblemTitle("");
    setMembers([
      { name: "", college_name: "", branch: "", section: "", year: "", reg_number: "", email: "", phone: "" },
      { name: "", college_name: "", branch: "", section: "", year: "", reg_number: "", email: "", phone: "" }
    ]);
  };

  const validateOiSubmission = async (): Promise<{ valid: boolean; problemTitle: string }> => {
    // Just verify that the email has a valid OI submission
    const trimmedEmail = oiEmail.trim().toLowerCase();

    const { data: oinnovationData, error } = await supabase
      .from("open_innovation_submissions")
      .select("problem_title")
      .eq("user_email", trimmedEmail)
      .single();

    if (error || !oinnovationData) {
      console.error("OI submission validation failed for email:", trimmedEmail);
      return { valid: false, problemTitle: "" };
    }

    return { valid: true, problemTitle: oinnovationData.problem_title };
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    
    // Only proceed if OI data is loaded (meaning user clicked LOAD and found submission)
    if (!oiProblemId) {
      // Don't show modal - the warning card is already visible above
      return;
    }

    // Validate all phone numbers are exactly 10 digits
    for (let i = 0; i < members.length; i++) {
      const phone = members[i].phone.trim();
      if (!phone || phone.length !== 10) {
        alert(`Please enter a valid 10-digit mobile number for member ${i + 1}`);
        return;
      }
    }

    setLoading(true);

    // Validate Open Innovation email + problem_id
    const validation = await validateOiSubmission();
    
    if (!validation.valid) {
      setLoading(false);
      return setModal({
        show: true,
        type: 'denied',
        message: "❌ You must first register in Open Innovation before registering a team. Please submit your Open Innovation problem first, then return to register your team."
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

    // 🔐 CHECK IF LEAD EMAIL EXISTS IN OPEN_INNOVATION TABLE
    const { data: leadInOI } = await supabase
      .from("open_innovation")
      .select("email")
      .eq("email", leadEmail)
      .single();

    if (leadInOI) {
      setLoading(false);
      return setModal({
        show: true, 
        type: 'denied', 
        message: `You are already registered with this email.`,
        email: leadEmail
      });
    }

    // 🔐 CHECK IF LEAD EMAIL EXISTS IN PARTICIPANTS TABLE
    const { data: leadInParticipants } = await supabase
      .from("participants")
      .select("email")
      .eq("email", leadEmail)
      .single();

    if (leadInParticipants) {
      setLoading(false);
      return setModal({
        show: true, 
        type: 'denied', 
        message: `You are already registered with this email.`,
        email: leadEmail
      });
    }

    // 🔐 CHECK FOR OTHER MEMBER EMAILS IN PARTICIPANTS TABLE  
    const { data: existingParticipants } = await supabase
      .from("participants")
      .select("email")
      .in("email", emails);

    if (existingParticipants && existingParticipants.length > 0) {
      setLoading(false);
      return setModal({
        show: true, type: 'denied', 
        message: `You are already registered with this email.`
      });
    }

    // 🔐 CHECK FOR OTHER MEMBER EMAILS IN OPEN_INNOVATION TABLE
    const { data: existingOI } = await supabase
      .from("open_innovation")
      .select("email")
      .in("email", emails);

    if (existingOI && existingOI.length > 0) {
      setLoading(false);
      return setModal({
        show: true, type: 'denied', 
        message: `You are already registered with this email.`
      });
    }

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
        message: `The Leader email (${leadEmail}) is already assigned to a team.`
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
      lead_name: processedMembers[0].name,
      email: processedMembers[0].email,
      phone: processedMembers[0].phone,
      reg_number: processedMembers[0].reg_number,
      members_data: JSON.stringify(processedMembers),
      track: "Open Innovation", 
      problem_id: oiProblemId, 
      problem_name: validation.problemTitle
    }]).select().single();

    if (tErr) { 
      console.error("Team creation error:", tErr);
      setLoading(false); 
      return setModal({ show: true, type: 'denied', message: `Team creation failed: ${tErr.message}` }); 
    }

    // 5. Save Participants with Generated Passwords + Team Info (denormalized)
    const { error: pErr } = await supabase.from("participants").insert(
      processedMembers.map((m, i) => ({ 
        team_id: team.id, 
        ...m, 
        is_leader: i === 0,
        team_name: team.team_name,
        team_leader_email: team.lead_email,
        team_leader_name: processedMembers[0].name,
        problem_id: team.problem_id,
        track: team.track
      }))
    );

    if (pErr) {
      await supabase.from("teams").delete().eq("id", team.id);
      setLoading(false);
      return setModal({ show: true, type: 'denied', message: "Submission Error" });
    }

    // 6. Send Open Innovation Registration Email
    try {
      const membersHtml = processedMembers.map((m, i) => `
        <tr style="border-bottom: 1px solid #30363d;">
          <td style="padding: 8px; color: #c9d1d9; font-size: 11px; word-break: break-word;">${i + 1}</td>
          <td style="padding: 8px; color: #c9d1d9; font-size: 11px; word-break: break-word;">${m.name}</td>
          <td style="padding: 8px; color: #c9d1d9; font-size: 11px; word-break: break-word;">${m.reg_number}</td>
          <td style="padding: 8px; color: #c9d1d9; font-size: 10px; word-break: break-all;">${m.email}</td>
          <td style="padding: 8px; color: #c9d1d9; font-size: 11px; word-break: break-word;">${m.college_name}</td>
          <td style="padding: 8px; color: #c9d1d9; font-size: 11px; word-break: break-word;">${m.branch}</td>
          <td style="padding: 8px; color: #c9d1d9; font-size: 11px; word-break: break-word;">${m.year}</td>
        </tr>
      `).join('');

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #0d1117; color: #c9d1d9; padding: 20px;">
          <div style="border-left: 4px solid #a371f7; padding-left: 20px; margin-bottom: 30px;">
            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">Welcome to TECHINNOVA 2026</h1>
            <p style="color: #8b949e; margin: 0;">Your Open Innovation team registration has been confirmed!</p>
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
            <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px;">Open Innovation</p>

            <p style="color: #8b949e; margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Problem ID</p>
            <p style="color: #58a6ff; margin: 0 0 15px 0; font-size: 14px; font-weight: bold;">${oiProblemId}</p>

            <p style="color: #8b949e; margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Problem Title</p>
            <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 14px;">${validation.problemTitle}</p>
          </div>

          <div style="background-color: #161b22; border: 1px solid #30363d; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #a371f7; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Team Members</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; overflow-wrap: break-word;">
              <thead>
                <tr style="border-bottom: 2px solid #a371f7;">
                  <th style="padding: 8px; text-align: left; color: #a371f7; font-weight: bold; font-size: 11px;">S.No</th>
                  <th style="padding: 8px; text-align: left; color: #a371f7; font-weight: bold; font-size: 11px;">Name</th>
                  <th style="padding: 8px; text-align: left; color: #a371f7; font-weight: bold; font-size: 11px;">Reg No</th>
                  <th style="padding: 8px; text-align: left; color: #a371f7; font-weight: bold; font-size: 11px;">Email</th>
                  <th style="padding: 8px; text-align: left; color: #a371f7; font-weight: bold; font-size: 11px;">College</th>
                  <th style="padding: 8px; text-align: left; color: #a371f7; font-weight: bold; font-size: 11px;">Branch</th>
                  <th style="padding: 8px; text-align: left; color: #a371f7; font-weight: bold; font-size: 11px;">Year</th>
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
            <a href="https://chat.whatsapp.com/BWukQZKcVjx4urArSWKzv1" style="display: inline-block; background-color: #25d366; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; transition: background-color 0.3s;">Join WhatsApp Group</a>
          </div>

          <div style="text-align: center; color: #8b949e; font-size: 12px; border-top: 1px solid #30363d; padding-top: 20px;">
            <p style="margin: 0;">TECHINNOVA 2026 - Open Innovation Registration Confirmed</p>
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
          problemId: oiProblemId,
          subject: `Open Innovation Registration Confirmed: ${genId}`,
          htmlContent: emailContent,
          isTeamRegistration: true
        })
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#a371f7', '#ffffff'] });
    setModal({ show: true, type: 'success', message: cfg?.success_title || "Congratulations! You have Registered Successfully.", id: genId, whatsappLink: "https://chat.whatsapp.com/BWukQZKcVjx4urArSWKzv1" });
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
              {modal.type === 'success' && modal.whatsappLink && (
                <a href={modal.whatsappLink} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-[#25d366] hover:bg-[#1d9e4d] text-white font-bold rounded-md transition-colors uppercase text-sm mb-3 text-center">
                  Join WhatsApp Group
                </a>
              )}
              {modal.type === 'denied' && modal.email && !modal.message.includes("Open Innovation") && (
                <button onClick={handleResendEmail} className="w-full py-3 bg-[#a371f7] hover:bg-[#b388f9] text-white font-bold rounded-md transition-colors uppercase text-sm flex items-center justify-center gap-2 mb-3">
                  Resend Email
                </button>
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
        
        <form id="form-section" onSubmit={handleRegister} className="space-y-8">
          {/* Show based on state */}
          {checkEmailMode && !existingTeamData && !emailNotFound ? (
            // Initial Check Email Screen
            <section className="bg-[#161b22] p-8 rounded-xl border border-[#30363d]">
              <h2 className="text-lg font-bold text-[#a371f7] uppercase mb-6 tracking-tight">Check Your Registration</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#8b949e] ml-1">Enter Your Email</label>
                  <input type="email" required placeholder="your@email.com" value={oiEmail} onChange={e => setOiEmail(e.target.value)} className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3 outline-none focus:border-[#a371f7] transition-colors text-sm" />
                </div>

                <button 
                  type="button" 
                  onClick={checkExistingEmail}
                  disabled={checkingEmail || !oiEmail.trim()}
                  className="w-full py-3 bg-[#a371f7] hover:bg-[#b388f9] disabled:bg-[#30363d] disabled:cursor-not-allowed text-white font-bold rounded-md transition-colors uppercase text-sm flex items-center justify-center gap-2"
                >
                  {checkingEmail ? "Checking..." : "🔍 Check Email"}
                </button>
              </div>
            </section>
          ) : existingTeamData?.isFound ? (
            // Existing Registration Found Screen
            <section className="bg-[#161b22] p-8 rounded-xl border border-[#30363d]">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 size={24} className="text-[#a371f7]" />
                <h2 className="text-lg font-bold text-[#a371f7] uppercase tracking-tight">Registration Found</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-[#0d1117] border border-[#a371f7]/30 rounded-lg p-6">
                  <p className="text-xs font-medium text-[#8b949e] uppercase mb-2">Team Name</p>
                  <p className="text-xl font-bold text-[#a371f7]">{existingTeamData.team.team_name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                    <p className="text-xs font-medium text-[#8b949e] uppercase mb-2">Problem ID</p>
                    <p className="text-lg font-bold text-[#58a6ff] font-mono">{existingTeamData.team.problem_id}</p>
                  </div>

                  <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                    <p className="text-xs font-medium text-[#8b949e] uppercase mb-2">Track</p>
                    <p className="text-lg font-bold text-[#c9d1d9]">Open Innovation</p>
                  </div>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                  <p className="text-xs font-medium text-[#8b949e] uppercase mb-2">Problem Title</p>
                  <p className="text-base font-semibold text-[#c9d1d9]">{existingTeamData.team.problem_name}</p>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
                  <p className="text-xs font-medium text-[#8b949e] uppercase mb-3">Lead Email</p>
                  <p className="text-sm font-mono text-[#a371f7] break-all">{existingTeamData.participant.email}</p>
                </div>

                <button
                  type="button"
                  onClick={() => window.location.href = "/"}
                  className="w-full py-3 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-md transition-colors uppercase text-sm"
                >
                  ✓ Go to Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCheckEmailMode(true);
                    setExistingTeamData(null);
                    setEmailNotFound(false);
                    setOiEmail("");
                  }}
                  className="w-full py-3 bg-[#30363d] hover:bg-[#444c56] text-white font-bold rounded-md transition-colors uppercase text-sm"
                >
                  🔄 Check Another Email
                </button>
              </div>
            </section>
          ) : emailNotFound && checkEmailMode && !existingTeamData ? (
            // Email Not Found - Show Register Button Screen
            <section className="bg-[#161b22] p-8 rounded-xl border border-[#30363d]">
              <div className="text-center mb-8">
                <ShieldAlert size={48} className="text-orange-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white uppercase mb-2">Email Not Found</h2>
                <p className="text-[#8b949e]">This email is not registered yet.</p>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={startNewRegistration}
                  className="w-full py-4 bg-[#a371f7] hover:bg-[#b388f9] text-white font-bold rounded-md transition-colors uppercase text-base flex items-center justify-center gap-2"
                >
                  🚀 Register in Open Innovation
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCheckEmailMode(true);
                    setExistingTeamData(null);
                    setEmailNotFound(false);
                    setOiEmail("");
                  }}
                  className="w-full py-3 bg-[#30363d] hover:bg-[#444c56] text-white font-bold rounded-md transition-colors uppercase text-sm"
                >
                  ← Check Another Email
                </button>
              </div>
            </section>
          ) : !checkEmailMode ? (
            // Registration Form
            <>
              <section className="bg-[#161b22] p-8 rounded-xl border border-[#30363d]">
                <h2 className="text-lg font-bold text-[#a371f7] uppercase mb-6 tracking-tight">Your Open Innovation Submission</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#8b949e] ml-1">Your Email</label>
                    <div className="flex gap-2">
                      <input type="email" required placeholder="your@email.com" value={oiEmail} onChange={e => setOiEmail(e.target.value)} className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-3 outline-none focus:border-[#a371f7] transition-colors text-sm" />
                      <button 
                        type="button"
                        onClick={() => loadSubmissionData(oiEmail)}
                        disabled={loadingSubmission || !oiEmail.trim()}
                        className="px-4 py-3 bg-[#a371f7] hover:bg-[#b388f9] disabled:bg-[#30363d] disabled:cursor-not-allowed text-white font-bold rounded-md transition-colors uppercase text-xs"
                      >
                        {loadingSubmission ? "..." : "Load"}
                      </button>
                    </div>
                  </div>

                  {loadingSubmission && (
                    <div className="text-center py-4">
                      <p className="text-[#8b949e] text-sm">Loading your submission...</p>
                    </div>
                  )}

                  {submissionError && (
                    <div className={`rounded-lg px-6 py-8 text-center mt-6 border ${
                      submissionError.includes("multiple tracks") 
                        ? "bg-red-500/20 border-red-500" 
                        : "bg-orange-500/20 border-orange-500"
                    }`}>
                      <ShieldAlert size={48} className={submissionError.includes("multiple tracks") ? "text-red-500" : "text-orange-500"} />
                      
                      {submissionError.includes("multiple tracks") ? (
                        <>
                          <h3 className="text-xl font-bold text-white mb-2">Already Registered</h3>
                          <p className="text-[#8b949e] mb-6 text-sm">You have already registered in another track. You cannot register in multiple tracks.</p>
                          <p className="text-[#8b949e] text-xs">Please contact the organizing committee if you need assistance.</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-bold text-white mb-2">Not Registered in Open Innovation</h3>
                          <p className="text-[#8b949e] mb-6 text-sm">You need to submit your problem to the Open Innovation platform first before registering a team.</p>
                          <a 
                            href="https://techinnova-2k26.vercel.app/open-innovation" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors uppercase text-sm"
                          >
                            🚀 Go to Open Innovation
                          </a>
                        </>
                      )}
                    </div>
                  )}

                  {oiProblemId && !submissionError && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-[#30363d]">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[#8b949e] ml-1">Problem ID</label>
                        <div className="w-full bg-[#0d1117] border border-[#a371f7]/50 rounded-md px-4 py-3 text-sm text-[#a371f7] font-semibold font-mono">
                          {oiProblemId}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[#8b949e] ml-1">Team Name</label>
                        <div className="w-full bg-[#0d1117] border border-[#a371f7]/50 rounded-md px-4 py-3 text-sm text-[#a371f7] font-semibold uppercase">
                          {teamName}
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-medium text-[#8b949e] ml-1">Problem Title</label>
                        <div className="w-full bg-[#0d1117] border border-[#a371f7]/50 rounded-md px-4 py-3 text-sm text-[#a371f7] font-semibold">
                          {oiProblemTitle}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          ) : null}

          {/* Team Members Section - Only show if OI data is loaded */}
          {!checkEmailMode && oiProblemId && (
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
                        <label className="text-[10px] text-[#8b949e] uppercase">College Name</label>
                        <input required value={m.college_name} onChange={e => handleUpdate(i, 'college_name', e.target.value.toUpperCase())} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7]" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase">Branch</label>
                        <input required value={m.branch} onChange={e => handleUpdate(i, 'branch', e.target.value.toUpperCase())} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7]" placeholder="e.g., CSE, ECE, ME" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase">Reg Number</label>
                        <input required value={m.reg_number} onChange={e => handleUpdate(i, 'reg_number', e.target.value)} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7] font-mono" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase">Year</label>
                        <input required value={m.year} onChange={e => handleUpdate(i, 'year', e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7]" placeholder="e.g., 1, 2, 3, 4" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase">Section</label>
                        <input required value={m.section} onChange={e => handleUpdate(i, 'section', e.target.value.toUpperCase())} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7]" placeholder="e.g., A, B, C" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase">Email</label>
                        <input type="email" required value={m.email} onChange={e => handleUpdate(i, 'email', e.target.value)} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7]" />
                    </div>

                    <div className="space-y-1 md:col-span-1">
                        <label className="text-[10px] text-[#8b949e] uppercase flex items-center gap-1"><Phone size={10}/> Mobile Number</label>
                        <input type="tel" required minLength={10} maxLength={10} value={m.phone} onChange={e => handleUpdate(i, 'phone', e.target.value)} className="w-full bg-transparent border-b border-[#30363d] py-2 text-sm outline-none focus:border-[#a371f7]" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {members.length < 4 && (
              <button 
                type="button" 
                onClick={() => setMembers([...members, { name: "", college_name: "", branch: "", section: "", year: "", reg_number: "", email: "", phone: "" }])} 
                className="w-full py-4 border border-dashed border-[#30363d] rounded-xl text-[#8b949e] hover:text-[#a371f7] hover:border-[#a371f7]/50 transition-all uppercase text-[10px] flex items-center justify-center gap-2 tracking-widest"
              >
                <UserPlus size={14} /> ADD MEMBERS
              </button>
            )}
          </div>
          )}

          {/* Submit Button - Only show for new registration */}
          {!checkEmailMode && (
            <button 
              type="submit" 
              disabled={loading || !oiProblemId} 
              className="w-full py-4 bg-[#a371f7] hover:bg-[#b388f9] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase rounded-md shadow-lg transition-all tracking-widest"
              title={!oiProblemId ? "Load your OI submission first by clicking LOAD button" : ""}
            >
              {loading ? "Registering..." : "Register Team"}
            </button>
          )}
        </form>
      </div>
    </main>
  );
}
