"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQ({ limit }: { limit?: number }) {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchFaqs() {
      // Fetching and ordering by custom display_order
      const { data } = await supabase.from('faqs').select('*').order('display_order');
      if (data) setFaqs(limit ? data.slice(0, limit) : data);
    }
    fetchFaqs();
  }, [limit]);

  return (
    <div className="space-y-3 w-full">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={faq.id} 
            className={`border transition-all duration-200 rounded-lg overflow-hidden 
              ${isOpen ? 'border-[#30363d] bg-[#161b22]' : 'border-[#30363d] bg-transparent hover:bg-[#161b22]/50'}`}
          >
            <button 
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full p-4 text-left flex justify-between items-center group"
            >
              <div className="flex items-center gap-3">
                {/* 💡 Icon updated to Purple accent [#a371f7] */}
                <HelpCircle size={16} className={isOpen ? 'text-[#a371f7]' : 'text-[#8b949e] group-hover:text-[#a371f7]'} />
                
                {/* 💡 Text colors updated: Blue/Cyan removed in favor of Purple and White */}
                <span className={`text-sm font-semibold transition-colors
                  ${isOpen ? 'text-[#a371f7]' : 'text-[#c9d1d9] group-hover:text-[#a371f7]'}`}>
                  {faq.question}
                </span>
              </div>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#a371f7]' : 'text-[#8b949e]'}`} 
              />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: "auto", opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }} 
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-11 pb-5 text-sm text-[#8b949e] leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}