"use client";
import { useEffect, useRef, useState } from "react";

export default function AboutSection({ content }: { content?: string }) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(section);
    return () => observer.unobserve(section);
  }, []);

  return (
    <section ref={ref} id="about" className="relative min-h-screen flex flex-col justify-center bg-[#0B1120] py-32 px-6">
      <div className={`max-w-4xl mx-auto text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <h2 className="text-lg md:text-xl lg:text-2xl font-black italic text-white uppercase mb-8">About The <span className="text-cyan-400">Event</span></h2>
        <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
          {content || "Tech Innovate 2026 is the premier 3-hour hackathon where 500 minds compete to build the future."}
        </p>
      </div>
    </section>
  );
}