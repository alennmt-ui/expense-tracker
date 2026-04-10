import { useState } from 'react';
import { CreditCard, Calendar, Tag, DollarSign, CheckCircle } from 'lucide-react';
import Modal from '../Modal';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (subscription: {
    name: string;
    amount: number;
    billing_date: number;
    category: string;
  }) => void;
}

export default function AddSubscriptionModal({ isOpen, onClose, onAdd }: AddSubscriptionModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingDate, setBillingDate] = useState('1');
  const [category, setCategory] = useState('Entertainment');

  const handleSubmit = () => {
    if (!name || !amount || parseFloat(amount) <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }
    
    onAdd({
      name,
      amount: parseFloat(amount),
      billing_date: parseInt(billingDate),
      category,
    });

    // Reset form
    setName('');
    setAmount('');
    setBillingDate('1');
    setCategory('Entertainment');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Subscription">
      <div className="px-8 pb-8 space-y-6">
        {/* Amount Input */}
        <div className="text-center py-4">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Monthly Cost</label>
          <div className="inline-flex items-center justify-center">
            <span className="text-3xl font-extrabold text-on-surface-variant mr-1">$</span>
            <input
              autoFocus
              className="w-40 bg-transparent border-none text-4xl font-black font-headline text-on-surface placeholder:text-surface-container-highest focus:ring-0 text-center p-0"
              placeholder="0.00"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Service Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-on-surface-variant ml-1 uppercase tracking-wider">Service Name</label>
            <div className="relative flex items-center bg-surface-container-low rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-surface-tint/20 transition-all">
              <CreditCard className="w-5 h-5 text-on-surface-variant mr-3" />
              <input
                className="bg-transparent border-none p-0 w-full text-sm font-medium focus:ring-0 text-on-surface"
                placeholder="e.g. Netflix, Spotify"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Billing Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-on-surface-variant ml-1 uppercase tracking-wider">Billing Date</label>
            <div className="relative flex items-center bg-surface-container-low rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-surface-tint/20 transition-all">
              <Calendar className="w-5 h-5 text-on-surface-variant mr-3" />
              <select
                className="bg-transparent border-none p-0 w-full text-sm font-medium focus:ring-0 text-on-surface"
                value={billingDate}
                onChange={(e) => setBillingDate(e.target.value)}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of month</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-on-surface-variant ml-1 uppercase tracking-wider">Category</label>
            <div className="relative flex items-center bg-surface-container-low rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-surface-tint/20 transition-all">
              <Tag className="w-5 h-5 text-on-surface-variant mr-3" />
              <select
                className="bg-transparent border-none p-0 w-full text-sm font-medium focus:ring-0 text-on-surface"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Entertainment">Entertainment</option>
                <option value="Software">Software</option>
                <option value="Utilities">Utilities</option>
                <option value="Health">Health & Fitness</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex flex-col gap-3">
          <button 
            onClick={handleSubmit}
            className="w-full h-14 bg-gradient-to-r from-on-primary-container to-surface-tint text-white rounded-xl font-bold text-base tracking-wide shadow-lg shadow-surface-tint/20 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5 fill-current" />
            Add Subscription
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
