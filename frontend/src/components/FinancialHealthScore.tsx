import { ShieldCheck } from 'lucide-react';

interface FinancialHealthScoreProps {
  score: number;
  onClick?: () => void;
}

export default function FinancialHealthScore({ score, onClick }: FinancialHealthScoreProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-surface-container-high rounded-3xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-surface-container-highest transition-colors"
    >
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-surface-container-highest"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={364.4}
            strokeDashoffset={364.4 * (1 - score / 100)}
            className="text-primary"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-headline font-bold text-on-surface">{score}</span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Score</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-primary">
        <ShieldCheck className="w-5 h-5" />
        <span className="text-sm font-bold">Excellent Health</span>
      </div>
    </div>
  );
}
