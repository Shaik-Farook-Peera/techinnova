"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase"; 
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react'; // Import close icon

export default function HowToCode() {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  useEffect(() => {
    async function getVideos() {
      const { data } = await supabase.from('demo_videos').select('*').order('order_index');
      if (data) setVideos(data);
    }
    getVideos();
  }, []);

  return (
    <section className="py-10 bg-inherit overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-6 uppercase tracking-tighter">
          How to <span className="text-[#8957e5]">Code</span>
        </h2>
        
        {/* Horizontal Reels Container */}
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x no-scrollbar scroll-smooth">
          {videos.map((vid) => (
            <motion.div 
              key={vid.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedVideo(vid)} // 💡 CLICK TO OPEN
              className="flex-shrink-0 w-[160px] md:w-[200px] h-[280px] md:h-[350px] bg-[#1c2128] rounded-xl border border-[#30363d] overflow-hidden snap-center relative shadow-lg cursor-pointer group"
            >
              <video 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                muted 
                loop 
                playsInline 
                onMouseOver={(e) => e.currentTarget.play()} // 💡 HOVER TO PLAY
                onMouseOut={(e) => {
                   e.currentTarget.pause();
                   e.currentTarget.currentTime = 0; // Reset on exit
                }}
              >
                <source src={vid.video_url} type="video/mp4" />
              </video>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-white font-mono text-[10px] md:text-[11px] font-bold uppercase truncate">{vid.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 💡 FULL VIDEO MODAL */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedVideo(null)} // Close on background click
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking video
            >
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-[110] p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>
              <video 
                className="w-full h-full"
                controls 
                autoPlay // 💡 PLAY WITH SOUND ON CLICK
              >
                <source src={selectedVideo.video_url} type="video/mp4" />
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}