import { useState } from 'react';
import { User, Calendar, Clock, Wallet, Zap, PieChart, Gift, PlusCircle } from 'lucide-react';
import Modal from '../Modal';
import { Transaction } from '@/src/types';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (income: Omit<Transaction, 'id' | 'type'>) => void;
}

export default function AddIncomeModal({ isOpen, onClose, onAdd }: AddIncomeModalProps) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Salary');

  const handleSubmit = () => {
    if (!source || !amount || parseFloat(amount) <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }
    
    onAdd({
      merchant: source,
      amount: Math.abs(parseFloat(amount) || 0),
      date,
      category,
      time: '10:30 AM',
      icon: category.toLowerCase().replace(' ', '_'),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Income">
      <div className="px-8 pb-8 space-y-8">
        {/* Amount Input */}
        <div className="text-center py-6">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">Total Amount</p>
          <div className="flex items-center justify-center gap-1">
            <span className="font-headline text-4xl font-extrabold text-on-surface-variant">$</span>
            <input
              className="w-auto min-w-[120px] bg-transparent border-none focus:ring-0 font-headline text-6xl font-extrabold text-on-surface p-0 text-center tracking-tighter"
              placeholder="0.00"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payer/Source */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Payer / Source</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
              <input
                className="w-full pl-11 pr-4 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-surface-tint/20 transition-all font-medium text-sm text-on-surface"
                placeholder="e.g. Acme Corp"
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Transaction Timing</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                <input
                  className="w-full pl-10 pr-3 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-surface-tint/20 text-xs font-semibold text-on-surface"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                <input
                  className="w-full pl-10 pr-3 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-surface-tint/20 text-xs font-semibold text-on-surface"
                  type="text"
                  defaultValue="10:30 AM"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Classification</label>
            <button className="text-[10px] text-surface-tint font-bold hover:underline">Manage Categories</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Salary', icon: Wallet },
              { name: 'Side Hustle', icon: Zap },
              { name: 'Dividends', icon: PieChart },
              { name: 'Gift', icon: Gift },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = category === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold border-2 border-transparent flex items-center gap-2 active:scale-95 transition-all",
                    isActive 
                      ? "bg-secondary-container text-on-secondary-container" 
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive && "fill-current")} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Contextual Notes</label>
          <textarea
            className="w-full p-4 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-surface-tint/20 transition-all font-medium text-sm text-on-surface resize-none"
            placeholder="Add a description or tags..."
            rows={3}
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-container-low/50 rounded-2xl flex flex-col gap-3">
          <button 
            onClick={handleSubmit}
            className="w-full bg-on-primary-container text-white py-4 rounded-xl font-bold text-sm shadow-[0_8px_20px_rgba(73,124,255,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Add Income
          </button>
          <button className="w-full bg-surface-container-highest text-on-surface py-4 rounded-xl font-bold text-sm hover:bg-white transition-all uppercase tracking-widest">
            Save as Draft
          </button>
        </div>
      </div>
    </Modal>
  );
}

import { cn } from '@/src/lib/utils';
