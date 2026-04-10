import { Lock } from 'lucide-react';

interface FixedCostsCardProps {
  amount: number;
  percent: number;
  onClick?: () => void;
}

export default function FixedCostsCard({ amount, percent, onClick }: FixedCostsCardProps) {
  return (
    <div 
      onClick={onClick}
      className="flex-1 bg-tertiary-container/30 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-tertiary-container/40 transition-colors"
    >
      <div>
        <p className="text-[10px] font-bold text-on-tertiary-container uppercase tracking-wider">Fixed Costs</p>
        <p className="text-lg font-headline font-bold text-on-tertiary-container">
          ${amount.toLocaleString()}
        </p>
      </div>
      <div className="flex flex-col items-end">
        <Lock className="w-6 h-6 text-on-tertiary-container" />
        <span className="text-[8px] font-bold text-on-tertiary-container">{percent}% of income</span>
      </div>
    </div>
  );
}
