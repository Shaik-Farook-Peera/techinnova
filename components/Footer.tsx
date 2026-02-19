"use client";
import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Terminal } from 'lucide-react';

export default function Footer({ config }: { config: any }) {
  // Logic to handle scroll-to-section vs page navigation
  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#0d1117] border-t border-[#30363d] pt-20 pb-10 px-6 mt-20 relative z-20 text-[#c9d1d9]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        
        {/* 1. BRANDING - TechInnovator */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#30363d] p-1.5 rounded-md">
              <Terminal size={18} className="text-[#a371f7]" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white uppercase">
              {config?.site_name || "IIC_BEC"} <span className="text-[#484f58]">/</span> <span className="text-[#a371f7]">TechInnova</span>
            </h2>
          </div>
          <p className="text-[#8b949e] text-sm leading-relaxed max-w-xs">
            {config?.footer_description || "Solving real-world problems through engineering and high-stakes innovation challenges."}
          </p>
        </div>

        {/* 2. QUICK NAVIGATION - Purple Hover & Nav Spy Sync */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[#f0f6fc] text-[11px] font-bold uppercase tracking-wider mb-2 opacity-50">
            Quick Links
          </h4>
          <div className="flex flex-col gap-3 text-[#8b949e] text-xs font-medium uppercase tracking-tight">
            {/* Smooth Scroll Links */}
            <button onClick={() => handleNavClick('home')} className="text-left hover:text-[#a371f7] transition-colors">Home</button>
            <button onClick={() => handleNavClick('tracks')} className="text-left hover:text-[#a371f7] transition-colors">Tracks</button>
            <button onClick={() => handleNavClick('timeline')} className="text-left hover:text-[#a371f7] transition-colors">Timeline</button>
            
            {/* Page Links */}
            <Link href="/about" className="hover:text-[#a371f7] transition-colors">About</Link>
            <Link href="/register" className="hover:text-[#a371f7] transition-colors">Register</Link>
            <Link href="/faq" className="hover:text-[#a371f7] transition-colors">FAQ</Link>
          </div>
        </div>

        {/* 3. CONTACT SECTION - Pulls from contact_title */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[#f0f6fc] text-[11px] font-bold uppercase tracking-wider mb-2 opacity-50">
            {config?.contact_title || "CONTACT US"}
          </h4>
          
          <div className="text-[#8b949e] text-sm flex flex-col gap-4">
            <div className="flex items-center gap-3 group">
              <Mail size={16} className="text-[#8b949e] group-hover:text-[#a371f7] transition-colors" />
              <span className="font-mono text-xs group-hover:text-white transition-colors">
                {config?.contact_email || "contact@iicbec.org"}
              </span>
            </div>

            <div className="flex items-center gap-3 group">
              <Phone size={16} className="text-[#8b949e] group-hover:text-[#a371f7] transition-colors" />
              <span className="font-mono text-xs group-hover:text-white transition-colors">
                {config?.contact_phone || "+91 98765 43210"}
              </span>
            </div>

            <div className="flex items-center gap-3 group">
              <MapPin size={16} className="text-[#8b949e] group-hover:text-[#a371f7] transition-colors" />
              <span className="text-xs uppercase tracking-tight leading-snug group-hover:text-white transition-colors">
                {config?.location || "Innovation Lab, BEC Campus"}
              </span>
            </div>
            
            {/* Social Channels with Purple Hover Glow */}
            <div className="flex flex-wrap gap-2 mt-4">
              {config?.social_links?.map((social: any) => (
                <a 
                  key={social.name} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1 border border-[#30363d] rounded-md text-[10px] font-bold uppercase text-[#c9d1d9] hover:border-[#a371f7] hover:text-[#a371f7] hover:bg-[#a371f710] transition-all"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BAR - Purple System Pulse */}
      <div className="max-w-7xl mx-auto pt-10 border-t border-[#30363d] flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-medium uppercase tracking-widest text-[#484f58]">
          © 2026 {config?.site_name || "IIC BEC"} <span className="mx-2">|</span> DEPLOYED BY Farook Peera
        </p>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-[#a371f7] animate-pulse shadow-[0_0_8px_#a371f7]" />
           <span className="text-[10px] text-[#484f58] uppercase font-bold tracking-tighter">
             System Active
           </span>
        </div>
      </div>
    </footer>
  );
}