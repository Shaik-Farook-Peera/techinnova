"use client";
import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, AlertCircle } from "lucide-react";

export default function OfflineWrapper({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOffline) {
    return (
      <main className="fixed inset-0 z-[9999] bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center px-6 font-sans overflow-hidden">
        
        {/* 📡 Connection Lost Icon - Centered via Flex parent */}
        <div className="relative mb-10 flex items-center justify-center">
          <div className="w-32 h-32 bg-[#161b22] border-2 border-[#a371f7]/20 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(163,113,247,0.1)]">
            <WifiOff size={64} className="text-[#a371f7]" />
          </div>
          <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-2 border-4 border-[#0d1117]">
            <AlertCircle size={16} className="text-white" />
          </div>
        </div>

        {/* Status Message & Button Container - Forced Centering */}
        <div className="flex flex-col items-center text-center max-w-sm w-full">
          <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
            <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-red-500">
              System_Offline
            </span>
          </div>
          
          <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic leading-none">
            Connection Lost
          </h1>
          
          <p className="text-[#8b949e] text-xs leading-relaxed mb-12 uppercase tracking-[0.2em] opacity-80">
            Check your network 
          </p>

          {/* Action Button - mx-auto and w-fit ensure it stays centered */}
          <button 
            onClick={() => window.location.reload()}
            className="group mx-auto flex items-center justify-center gap-3 px-12 py-4 bg-[#a371f7] hover:bg-[#b388f9] text-white font-bold rounded-full uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-[#a371f7]/20 transition-all active:scale-95 w-fit"
          >
            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
            Retry
          </button>
        </div>

        {/* Background Grid */}
        <div className="absolute inset-0 z-[-1] opacity-[0.05] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      </main>
    );
  }

  return <>{children}</>;
}