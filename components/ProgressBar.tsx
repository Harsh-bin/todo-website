import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar = ({ percentage }: ProgressBarProps) => {
  const p = Math.max(0, Math.min(100, percentage));
  return (
    <div className="w-full bg-white/10 rounded-full h-4 my-1 relative overflow-hidden text-xs font-mono">
      <div
        className="bg-slate-300 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center"
        style={{ width: `${p}%` }}
      >
         <span className="text-black mix-blend-screen px-2 font-bold">{p.toFixed(2)}%</span>
      </div>
       {p < 50 && <span className="absolute inset-0 flex items-center justify-center text-slate-300">{p.toFixed(2)}%</span>}
    </div>
  );
};

export default ProgressBar;