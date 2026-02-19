"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";

export default function Coordinators() {
  const [staff, setStaff] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCoordinators() {
      const { data } = await supabase.from('coordinators').select('*').order('name');
      if (data) {
        setStaff(data.filter(c => c.role === 'Staff'));
        setStudents(data.filter(c => c.role === 'Student'));
      }
    }
    fetchCoordinators();
  }, []);

  const Card = ({ person }: { person: any }) => (
    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-cyan-400/50 transition-all">
      <h4 className="text-white font-bold text-lg">{person.name}</h4>
      <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-4">{person.designation}</p>
      <div className="text-gray-500 text-xs space-y-1">
        <p>📞 {person.phone}</p>
        {person.email && <p>📧 {person.email}</p>}
      </div>
    </div>
  );

  return (
    <section id="coordinators" className="py-24 px-6 bg-[#0B1120]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black italic uppercase text-white mb-20 tracking-tighter text-center">
          Event <span className="text-cyan-400">Coordinators</span>
        </h2>

        {/* STAFF SECTION */}
        <div className="mb-20">
          <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.4em] mb-10 border-l-4 border-cyan-400 pl-4">Staff Faculty</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {staff.map(p => <Card key={p.id} person={p} />)}
          </div>
        </div>

        {/* STUDENT SECTION */}
        <div>
          <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.4em] mb-10 border-l-4 border-cyan-400 pl-4">Student Leads</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {students.map(p => <Card key={p.id} person={p} />)}
          </div>
        </div>
      </div>
    </section>
  );
}