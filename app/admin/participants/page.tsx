"use client";

import { useEffect, useState } from "react";
import {
  getParticipantsGroupedByTeam,
  getTeamStatistics,
} from "@/lib/queries";
import Navbar from "@/components/Navbar";

export default function AdminParticipantsPage() {
  const [groupedParticipants, setGroupedParticipants] = useState<
    Record<string, any[]>
  >({});
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [participantsRes, statsRes] = await Promise.all([
      getParticipantsGroupedByTeam(),
      getTeamStatistics(),
    ]);

    if (participantsRes.success) {
      setGroupedParticipants(participantsRes.data);
    }

    if (statsRes.success) {
      setStatistics(statsRes.data);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0d1117] pt-32 pb-20 px-6">
        <p className="text-[#8b949e]">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1117] pt-32 pb-20 px-6 text-[#c9d1d9] font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 uppercase">
          Participants by <span className="text-[#a371f7]">Team</span>
        </h1>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <p className="text-[#8b949e] text-sm mb-2">Total Teams</p>
              <p className="text-3xl font-bold text-[#a371f7]">
                {statistics.totalTeams}
              </p>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <p className="text-[#8b949e] text-sm mb-2">Total Participants</p>
              <p className="text-3xl font-bold text-[#a371f7]">
                {statistics.totalParticipants}
              </p>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <p className="text-[#8b949e] text-sm mb-2">Avg Team Size</p>
              <p className="text-3xl font-bold text-[#a371f7]">
                {statistics.averageTeamSize}
              </p>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <p className="text-[#8b949e] text-sm mb-2">Tracks</p>
              <p className="text-3xl font-bold text-[#a371f7]">
                {Object.keys(statistics.trackBreakdown).length}
              </p>
            </div>
          </div>
        )}

        {/* Teams and Participants */}
        <div className="space-y-8">
          {Object.entries(groupedParticipants).map(
            ([teamName, participants]) => (
              <div
                key={teamName}
                className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden"
              >
                <div className="bg-[#0d1117] border-b border-[#30363d] px-6 py-4">
                  <h2 className="text-xl font-bold text-[#a371f7] uppercase">
                    {teamName}
                  </h2>
                  <p className="text-[#8b949e] text-sm">
                    Track: {participants[0]?.track || "Unknown"} | Members:{" "}
                    {participants.length}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#30363d]">
                        <th className="px-6 py-3 text-left text-[#a371f7] font-bold">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-[#a371f7] font-bold">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-[#a371f7] font-bold">
                          Reg Number
                        </th>
                        <th className="px-6 py-3 text-left text-[#a371f7] font-bold">
                          Branch
                        </th>
                        <th className="px-6 py-3 text-left text-[#a371f7] font-bold">
                          Year
                        </th>
                        <th className="px-6 py-3 text-left text-[#a371f7] font-bold">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-[#30363d] hover:bg-[#0d1117]/50"
                        >
                          <td className="px-6 py-3">{p.name}</td>
                          <td className="px-6 py-3 text-[#58a6ff]">{p.email}</td>
                          <td className="px-6 py-3 font-mono">{p.reg_number}</td>
                          <td className="px-6 py-3">{p.branch}</td>
                          <td className="px-6 py-3">{p.year}</td>
                          <td className="px-6 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                p.is_leader
                                  ? "bg-[#a371f7]/30 text-[#a371f7]"
                                  : "bg-[#30363d]/50 text-[#8b949e]"
                              }`}
                            >
                              {p.is_leader ? "Leader" : "Member"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}
