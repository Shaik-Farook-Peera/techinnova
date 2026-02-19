"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center px-4 md:px-6 font-sans relative overflow-hidden">
      <Navbar />
      
      <div className="relative flex items-center justify-center w-full max-w-5xl h-[400px] md:h-[500px]">
        
        {/* Large '4_4' Background Text - Adjusted for perfect centering behind the TV */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
          <h1 className="text-[12rem] sm:text-[20rem] md:text-[30rem] lg:text-[35rem] font-black text-[#161b22] tracking-tighter flex items-center gap-[80px] md:gap-[200px]">
            <span>4</span>
            <span> </span>
            <span>4</span>
          </h1>
        </div>

        {/* TV Container (Acts as the '0') */}
        <div className="relative z-10 flex flex-col items-center w-[200px] sm:w-[260px] md:w-[360px] lg:w-[420px]">
          
          {/* Antennas - Responsive heights */}
          <div className="flex gap-12 md:gap-20 -mb-2 md:-mb-4">
            <motion.div 
              initial={{ rotate: -25 }}
              animate={{ rotate: [-24, -26, -24] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1 md:w-1.5 h-16 md:h-24 bg-[#30363d] origin-bottom rounded-full relative"
            >
              <div className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 bg-[#30363d] rounded-full absolute -top-1 -left-1" />
            </motion.div>
            <motion.div 
              initial={{ rotate: 25 }}
              animate={{ rotate: [26, 24, 26] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1 md:w-1.5 h-16 md:h-24 bg-[#30363d] origin-bottom rounded-full relative"
            >
              <div className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 bg-[#30363d] rounded-full absolute -top-1 -left-1" />
            </motion.div>
          </div>

          {/* Purple TV Body with Glow */}
          <div className="w-full aspect-[1.3/1] bg-[#a371f7] rounded-[2.5rem] md:rounded-[3.5rem] p-3 md:p-5 shadow-[0_0_50px_rgba(163,113,247,0.2)] border-b-[6px] md:border-b-[12px] border-black/20 relative">
            <div className="flex h-full gap-2 md:gap-4">
              
              {/* Screen Area */}
              <div className="flex-[3.5] bg-[#161b22] rounded-2xl md:rounded-[2.5rem] border-[4px] md:border-[8px] border-[#0d1117] relative overflow-hidden flex items-center justify-center">
                 {/* Moving Static Noise */}
                 <motion.div 
                   animate={{ backgroundPosition: ["0px 0px", "120px 120px"] }}
                   transition={{ repeat: Infinity, duration: 0.15, ease: "linear" }}
                   className="absolute inset-0 opacity-[0.35] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
                 />
                 
                 {/* Floating Badge */}
                 <motion.div 
                    animate={{ y: [0, -3, 0], opacity: [1, 0.8, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className=" px-3 md:px-6 py-1.5 rounded-sm z-20 "
                 >
                   <span className="text-white font-black text-[15px] md:text-[20px] tracking-widest uppercase italic block">
                     Page Not Found
                   </span>
                 </motion.div>
              </div>

              {/* Functional Knobs */}
              <div className="flex-1 flex flex-col justify-center items-center gap-3 md:gap-6">
                <div className="w-7 h-7 md:w-12 md:h-12 rounded-full bg-[#0d1117] border-2 md:border-4 border-black/30 flex items-center justify-center shadow-inner group cursor-pointer">
                   <div className="w-1 md:w-1.5 h-4 md:h-6 bg-[#30363d] rounded-full rotate-45 group-hover:rotate-90 transition-transform" />
                </div>
                <div className="w-7 h-7 md:w-12 md:h-12 rounded-full bg-[#0d1117] border-2 md:border-4 border-black/30 flex items-center justify-center shadow-inner group cursor-pointer">
                   <div className="w-1 md:w-1.5 h-4 md:h-6 bg-[#30363d] rounded-full -rotate-12 group-hover:-rotate-45 transition-transform" />
                </div>
                <div className="flex flex-col gap-1.5 w-8 md:w-12 mt-2 opacity-20">
                  <div className="h-1.5 bg-black rounded-full" />
                  <div className="h-1.5 bg-black rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Feet */}
          <div className="flex justify-between w-3/4 px-6 -mt-1">
            <div className="w-5 md:w-8 h-3 md:h-4 bg-[#161b22] rounded-b-xl" />
            <div className="w-5 md:w-8 h-3 md:h-4 bg-[#161b22] rounded-b-xl" />
          </div>
        </div>
      </div>

      {/* Messaging & Call to Action */}
      <div className="mt-8 md:mt-12 text-center z-20 w-full max-w-md px-4">
        <p className="text-[#8b949e] text-xs md:text-sm mb-10 leading-relaxed uppercase tracking-[0.2em]">
          The requested Page does not exist
        </p>
        
        <Link 
          href="/" 
          className="group inline-flex items-center justify-center gap-3 px-10 py-4 bg-white text-black hover:bg-[#a371f7] hover:text-white font-black rounded-full transition-all duration-300 uppercase text-[11px] tracking-[0.2em] shadow-xl"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Home
        </Link>
      </div>

      {/* Theme-Consistent Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] -z-10" />
    </main>
  );
}