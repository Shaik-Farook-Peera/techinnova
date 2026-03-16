"use client";
import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';
import { Trophy, PartyPopper, Building2, School, Landmark, LayoutTemplate } from 'lucide-react';

export default function Timeline({ timeline }: { timeline?: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 📐 RESTORED: Your original 1700px path
  const pathD = "M 200 0 C 350 250, 50 500, 200 750 C 350 1000, 50 1250, 200 1500 L 200 1650";

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  // 💡 FIX: Map the robot's journey so it reaches 100% of the path 
  // when the scroll is only at 90%. This prevents it from going "under" the Victory card.
  const percentageProgress = useTransform(
    smoothProgress, 
    [0, 0.90], 
    ["0%", "95%"], 
    { clamp: true }
  );

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setIsFinished(latest > 0.88);
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => setIsScrolling(false), 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const data = timeline || [];

  return (
    // 💡 Tightened the section padding to pull the FAQ up
    <section id="timeline" className="relative pt-12 pb-0 bg-inherit px-4 overflow-hidden">
      <div className="relative z-10 w-full max-w-6xl mx-auto">

        {/* RESTORED: Your original 1700px container */}
        <div ref={containerRef} className="relative h-[1700px] w-[400px] mx-auto overflow-visible">
          
          <CampusScenery />

          {/* 🛤️ ROAD SVG */}
          <svg viewBox="0 0 400 1700" className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <path d={pathD} stroke="#30363d" strokeWidth="80" fill="none" strokeLinecap="round" />
            <path d={pathD} stroke="#161b22" strokeWidth="60" fill="none" strokeLinecap="round" />
            <path d={pathD} stroke="#8957e5" strokeWidth="3" fill="none" strokeDasharray="15 15" className="opacity-30" />
            <motion.path 
                d={pathD} 
                stroke="#8957e5" 
                strokeWidth="4" 
                fill="none" 
                style={{ pathLength: useTransform(smoothProgress, [0, 0.90], [0, 1], { clamp: true }) }} 
                className="drop-shadow-[0_0_12px_#8957e5]" 
            />
          </svg>

          {/* 🤖 RESTORED: YOUR ORIGINAL ROBOT DESIGN */}
          <motion.div 
            className="absolute top-0 left-0 pointer-events-none z-[100]"
            style={{ 
              offsetPath: `path('${pathD}')`, 
              offsetDistance: percentageProgress, 
              offsetRotate: '0deg',
            }}
          >
            <div className="absolute top-0 left-0 -translate-x-1/2 translate-y-[24px] flex items-center justify-center">
               <div className="relative scale-110 md:scale-125"> 
                  {isFinished && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-14 left-0 w-full flex justify-center text-[#f2cc60]">
                      <PartyPopper size={32} />
                    </motion.div>
                  )}

                  {/* Your Robot Head */}
                  <motion.div 
                    animate={isFinished ? { y: [0, -12, 0] } : (isScrolling ? { y: [0, 3, 0] } : { y: 0 })}
                    transition={{ repeat: Infinity, duration: isMobile ? 0.6 : 0.35 }}
                    className="w-12 h-10 bg-[#1c2128] border-2 border-[#8957e5] mx-auto relative z-20 shadow-[0_0_15px_rgba(137,87,229,0.4)] rounded-sm"
                  >
                    <div className="absolute top-3 left-3 flex gap-2">
                       <motion.div animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="w-2 h-2 bg-white rounded-full shadow-[0_0_5px_white]" />
                       <motion.div animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="w-2 h-2 bg-white rounded-full shadow-[0_0_5px_white]" />
                    </div>
                  </motion.div>
                  
                  {/* Your Robot Body */}
                  <div className="w-10 h-8 bg-[#0ea5e9] border-2 border-white mx-auto -mt-1 relative z-10 flex items-center justify-center">
                    <span className="text-[6px] font-mono font-bold text-white uppercase tracking-tighter">BOT-01</span>
                  </div>

                  {/* Your Robot Arms */}
                  <div className="absolute top-10 w-full flex justify-between px-[-2px]">
                     <motion.div 
                        animate={isFinished ? { rotate: [0, 160, 0] } : (isScrolling ? { rotate: [0, 45, -45, 0] } : { rotate: 0 })}
                        transition={{ repeat: Infinity, duration: isMobile ? 0.8 : 0.4 }}
                        className="w-2.5 h-5 bg-[#8957e5] origin-top rounded-sm border border-white"
                     />
                     <motion.div 
                        animate={isFinished ? { rotate: [0, -160, 0] } : (isScrolling ? { rotate: [0, -45, 45, 0] } : { rotate: 0 })}
                        transition={{ repeat: Infinity, duration: isMobile ? 0.8 : 0.4 }}
                        className="w-2.5 h-5 bg-[#8957e5] origin-top rounded-sm border border-white"
                     />
                  </div>

                  {/* Your Robot Legs */}
                  <div className="flex justify-center gap-1.5 -mt-0.5">
                     <motion.div animate={isScrolling ? { height: [10, 5, 10] } : { height: 10 }} transition={{ repeat: Infinity, duration: isMobile ? 0.4 : 0.2 }} className="w-3.5 h-3 bg-[#333] border border-white" />
                     <motion.div animate={isScrolling ? { height: [5, 10, 5] } : { height: 10 }} transition={{ repeat: Infinity, duration: isMobile ? 0.4 : 0.2, delay: 0.1 }} className="w-3.5 h-3 bg-[#333] border border-white" />
                  </div>
               </div>
            </div>
          </motion.div>

        {/* 📌 TIMELINE DATA - Desktop Paragraph Expansion */}
{data.map((item, index) => {
    const isLeftSide = index % 2 === 0; 
    const baseTop = index * (1200 / data.length);
    const leftSideVerticalOffset = 250;   
    const rightSideVerticalOffset = 250; 
    const topPos = baseTop + (isLeftSide ? leftSideVerticalOffset : rightSideVerticalOffset);

    const mobileLeftNudge = 30;   
    const mobileRightNudge = -40; 

    return (
     <div key={index} className="absolute w-full flex items-center pointer-events-none" style={{ top: `${topPos}px` }}>
       <div 
         className={`pointer-events-auto relative z-30 px-3 md:px-2 transition-all duration-300
           ${isLeftSide 
             ? 'mr-auto text-left md:-ml-24 lg:-ml-48' // Reduced negative margins on mobile
             : 'ml-auto text-right md:-mr-24 lg:-mr-48' // Reduced negative margins on mobile
           } 
           w-[calc(50%-20px)] md:w-[70%] lg:w-[80%]`} // Adjusted width for mobile
         style={{
           transform: typeof window !== 'undefined' && window.innerWidth < 768 
             ? `translateX(${isLeftSide ? mobileLeftNudge : mobileRightNudge}px)` 
             : 'none'
         }}
       >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }}
            className="max-w-xs md:max-w-md lg:max-w-xl" // Smaller max-width on mobile
          >
             <h3 className="text-white font-black text-xs md:text-xl lg:text-5xl uppercase tracking-tighter leading-none mb-1 drop-shadow-md">
               {item.title}
             </h3>
             <div className={`flex items-center gap-2 text-[7px] md:text-xs ${!isLeftSide && 'flex-row-reverse'}`}>
               <span className="text-[#8957e5] font-mono font-bold whitespace-nowrap">{item.time}</span>
               <div className="h-[1px] flex-1 bg-[#8957e5]/20" />
             </div>
             
             {/* 💡 THE PARAGRAPH: Truncated on mobile, full on desktop */}
             <p className="text-white/60 text-[9px] md:text-sm lg:text-base font-mono leading-relaxed mt-2">
                <span className="md:hidden">
                  {item.desc.length > 50 ? `${item.desc.substring(0, 50)}...` : item.desc}
                </span>
                <span className="hidden md:inline">
                  {item.desc}
                </span>
             </p>
          </motion.div>
       </div>
     </div>
    );
})}


          {/* 🏁 VICTORY SECTION - Hardcoded at the end of your 1700px path */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 w-full">
             <div className="bg-[#1c2128] border-4 border-[#f2cc60] p-6 text-center shadow-[10px_10px_0px_#000] w-[200px] rounded-xl">
                <Trophy size={48} className="mx-auto text-[#f2cc60] mb-2 animate-bounce" />
                <h3 className="text-2xl md:text-4xl font-mono font-black text-white italic tracking-tighter uppercase leading-none">VICTORY</h3>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CampusScenery() {
    return (
      <div className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 5 }}>
        <SceneryItem top="50px" left="2%" icon={<Landmark size={60} />} label="MAIN_BLOCK" color="#f2cc60" />
        <SceneryItem top="450px" right="20%" icon={<Building2 size={60} />} label="RP_BLOCK" color="#58a6ff" />
        <SceneryItem top="750px" left="2%" icon={<School size={60} />} label="NTR_BLOCK" color="#f778ba" />
        <SceneryItem top="1250px" right="20%" icon={<LayoutTemplate size={60} />} label="CMB_BLOCK" color="#d29922" />
        <SceneryItem top="1350px" left="2%" icon={<Landmark size={60} />} label="GEB" color="#f2cc60" />
      </div>
    );
}

function SceneryItem({ top, left, right, icon, label, color }: any) {
    return (
      <div style={{ top, left, right }} className="absolute flex flex-col items-center opacity-90 scale-90 md:scale-100">
        <div style={{ color }}>{icon}</div>
        <span style={{ borderColor: color, color }} className="text-[10px] md:text-sm font-black bg-[#1c2128] px-2 py-1 border-2 rounded uppercase tracking-tighter shadow-lg">
          {label}
        </span>
      </div>
    );
}