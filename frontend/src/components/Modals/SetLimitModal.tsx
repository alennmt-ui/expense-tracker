import { useState } from 'react';
import { X, Sparkles, Home, Sliders, Lock, User } from 'lucide-react';
import Modal from '../Modal';

interface SetLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLimit: number;
  onUpdate: (limit: number) => void;
}

export default function SetLimitModal({ isOpen, onClose, currentLimit, onUpdate }: SetLimitModalProps) {
  const [limit, setLimit] = useState(currentLimit);

  const handleUpdate = () => {
    onUpdate(limit);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Monthly Limit">
      <div className="px-8 pb-32 space-y-8">
        {/* Current Budget Summary */}
        <div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Monthly Income</p>
            <p className="font-headline font-bold text-lg text-secondary">$8,400.00</p>
          </div>
          <div className="w-px h-10 bg-outline-variant/20" />
          <div className="space-y-1 text-right">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Current Spend</p>
            <p className="font-headline font-bold text-lg text-on-surface">$3,240.50</p>
          </div>
        </div>

        {/* Limit Selection Section */}
        <div className="space-y-6">
          {/* Large Currency Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider">Target Limit</label>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-headline font-extrabold text-3xl text-on-surface-variant/40">$</span>
              <input
                className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-surface-tint rounded-xl py-6 pl-12 pr-6 font-headline font-extrabold text-3xl text-on-surface tracking-tight transition-all"
                type="text"
                value={limit.toLocaleString()}
                onChange={(e) => setLimit(parseFloat(e.target.value.replace(/,/g, '')) || 0)}
              />
            </div>
          </div>

          {/* Range Slider */}
          <div className="px-2 space-y-4">
            <div className="relative w-full h-1.5 bg-surface-container-highest rounded-full">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-on-primary-container to-surface-tint rounded-full" 
                style={{ width: `${(limit / 8400) * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max="8400"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-[6px] border-surface-tint rounded-full shadow-lg pointer-events-none" 
                style={{ left: `${(limit / 8400) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">
              <span>$0</span>
              <span>$8,400 (Income Cap)</span>
            </div>
          </div>

          {/* Percentage Chips */}
          <div className="flex flex-wrap gap-2">
            {[25, 50, 75].map((pct) => (
              <button 
                key={pct}
                onClick={() => setLimit(8400 * (pct / 100))}
                className="flex-1 min-w-[80px] py-2.5 bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant font-bold text-xs rounded-lg transition-colors"
              >
                {pct}%
              </button>
            ))}
            <button className="flex-1 min-w-[80px] py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg transition-all shadow-sm">Custom</button>
          </div>
        </div>

        {/* Impact Analysis */}
        <div className="bg-surface-container-low/50 border border-outline-variant/10 rounded-xl p-4 flex gap-4">
          <div className="bg-white/80 backdrop-blur-xl h-10 w-10 flex items-center justify-center rounded-lg shadow-sm flex-shrink-0">
            <Sparkles className="w-5 h-5 text-surface-tint fill-current" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-on-surface">Architect Insight</p>
            <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
              Setting this limit leaves <span className="font-bold text-secondary">${(8400 - limit - 4100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> for your wealth-building vault after estimated fixed costs.
            </p>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-surface-container-lowest/90 backdrop-blur-md flex flex-col gap-3 border-t border-outline-variant/10">
          <button 
            onClick={handleUpdate}
            className="w-full bg-gradient-to-r from-on-primary-container to-surface-tint text-white py-4 rounded-xl font-bold text-sm shadow-[0_4px_16px_rgba(0,83,219,0.24)] active:scale-95 transition-all"
          >
            Update Limit
          </button>
          <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors uppercase tracking-widest">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
