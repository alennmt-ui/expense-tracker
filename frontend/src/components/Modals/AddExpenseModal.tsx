import { useState, useEffect } from 'react';
import { Store, Calendar, Clock, Utensils, ShoppingBag, Car, Zap, Plus, CheckCircle, Camera, ChevronRight } from 'lucide-react';
import Modal from '../Modal';
import { Transaction } from '@/src/types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Transaction, 'id' | 'type'>, id?: string) => void;
  prefill?: { id?: string; merchant?: string; amount?: number; date?: string; category?: string };
}

export default function AddExpenseModal({ isOpen, onClose, onAdd, prefill }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Shopping');

  useEffect(() => {
    if (prefill) {
      if (prefill.amount) setAmount(Math.abs(prefill.amount).toString());
      if (prefill.merchant) setMerchant(prefill.merchant);
      if (prefill.date) setDate(prefill.date);
      if (prefill.category) setCategory(prefill.category);
    } else {
      setAmount('');
      setMerchant('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('Shopping');
    }
  }, [prefill, isOpen]);

  const handleSubmit = () => {
    if (!merchant || !amount || parseFloat(amount) <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }
    
    onAdd({
      merchant,
      amount: -Math.abs(parseFloat(amount) || 0),
      date,
      category,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: category.toLowerCase().replace(' ', '_'),
    }, prefill?.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={prefill?.id ? "Edit Expense" : "Add Expense"}>
      <div className="px-8 pb-8 space-y-8">
        {/* Amount Input */}
        <div className="text-center py-6">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Transaction Amount</label>
          <div className="inline-flex items-center justify-center group">
            <span className="text-4xl font-extrabold text-on-surface-variant mr-1">$</span>
            <input
              autoFocus
              className="w-48 bg-transparent border-none text-5xl font-black font-headline text-on-surface placeholder:text-surface-container-highest focus:ring-0 text-center p-0"
              placeholder="0.00"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Merchant */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-on-surface-variant ml-1 uppercase tracking-wider">Merchant / Source</label>
            <div className="relative flex items-center bg-surface-container-low rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-surface-tint/20 transition-all">
              <Store className="w-5 h-5 text-on-surface-variant mr-3" />
              <input
                className="bg-transparent border-none p-0 w-full text-sm font-medium focus:ring-0 text-on-surface"
                placeholder="e.g. Apple Store, Starbucks"
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-on-surface-variant ml-1 uppercase tracking-wider">Date</label>
              <div className="relative flex items-center bg-surface-container-low rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-surface-tint/20 transition-all">
                <Calendar className="w-4 h-4 text-on-surface-variant mr-2" />
                <input
                  className="bg-transparent border-none p-0 w-full text-sm font-medium focus:ring-0 text-on-surface"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-on-surface-variant ml-1 uppercase tracking-wider">Time</label>
              <div className="relative flex items-center bg-surface-container-low rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-surface-tint/20 transition-all">
                <Clock className="w-4 h-4 text-on-surface-variant mr-2" />
                <input
                  className="bg-transparent border-none p-0 w-full text-sm font-medium focus:ring-0 text-on-surface"
                  type="text"
                  defaultValue="14:30"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Category</label>
              <button className="text-[10px] text-surface-tint font-bold uppercase tracking-tighter hover:underline">Manage</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Dining', icon: Utensils },
                { name: 'Shopping', icon: ShoppingBag },
                { name: 'Travel', icon: Car },
                { name: 'Utilities', icon: Zap },
              ].map((cat) => {
                const Icon = cat.icon;
                const isActive = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold active:scale-95 transition-all",
                      isActive 
                        ? "bg-primary text-on-primary shadow-md" 
                        : "bg-surface-container-highest text-on-surface"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5", isActive && "fill-current")} />
                    {cat.name}
                  </button>
                );
              })}
              <button className="flex items-center justify-center w-10 h-8 rounded-xl bg-surface-container-low text-on-surface-variant border border-dashed border-outline-variant hover:bg-surface-container-high transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Receipt Upload */}
          <div className="mt-6">
            <div className="bg-surface-container-low rounded-2xl p-1">
              <div className="bg-white border border-outline-variant/10 rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:bg-surface-container-lowest transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface font-headline">Attach Receipt</h4>
                    <p className="text-xs text-on-surface-variant font-medium">OCR will extract data automatically</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-surface-container-highest" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1 pt-2">
            <label className="text-[11px] font-semibold text-on-surface-variant ml-1 uppercase tracking-wider">Notes (Optional)</label>
            <textarea
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 border-none text-sm font-medium focus:ring-2 focus:ring-surface-tint/20 text-on-surface resize-none placeholder:text-on-surface-variant/50"
              placeholder="Write a brief description..."
              rows={2}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex flex-col gap-3">
          <button 
            onClick={handleSubmit}
            className="w-full h-14 bg-gradient-to-r from-on-primary-container to-surface-tint text-white rounded-xl font-bold text-base tracking-wide shadow-lg shadow-surface-tint/20 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5 fill-current" />
            Add Expense
          </button>
          <button 
            onClick={onClose}
            className="w-full text-on-surface-variant text-sm font-bold tracking-tight hover:text-on-surface transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

import { cn } from '@/src/lib/utils';
