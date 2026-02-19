"use client";
import { useEffect, useState } from "react";

export default function Countdown({ targetDate }: { targetDate?: string }) {
  const calculateTimeLeft = () => {
    const eventTime = targetDate ? new Date(targetDate).getTime() : new Date("2026-02-20T00:00:00").getTime();
    const now = new Date().getTime();
    const difference = eventTime - now;

    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return <div className="mt-8 text-center text-cyan-400 font-black italic tracking-widest">EVENT HAS STARTED</div>;
  }

  const items = [
    { value: timeLeft.days, label: "DAYS" },
    { value: timeLeft.hours, label: "HOURS" },
    { value: timeLeft.minutes, label: "MINS" },
    { value: timeLeft.seconds, label: "SECS" },
  ];

  return (
    <div className="mt-10 w-full flex justify-center">
      <div className="w-full max-w-4xl px-4 md:px-8 py-4 border-t border-b border-cyan-400/20 flex justify-between items-center">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 relative">
            <span className="text-2xl md:text-5xl font-black text-white tabular-nums">
              {item.value.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] md:text-sm tracking-widest text-gray-500 font-bold mt-1">
              {item.label}
            </span>
            {index !== 3 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 md:h-10 w-[1px] bg-cyan-400/30" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}