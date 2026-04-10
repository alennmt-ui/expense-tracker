import { useState } from 'react';
import { Plus, X, Receipt, Landmark } from 'lucide-react';

interface MobileFABProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
}

export default function MobileFAB({ onAddExpense, onAddIncome }: MobileFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="mobile-fab-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Buttons */}
      <div className={`mobile-fab-actions ${isOpen ? 'open' : ''}`}>
        <button
          onClick={() => {
            onAddIncome();
            setIsOpen(false);
          }}
          className="mobile-fab-action"
        >
          <Landmark className="w-5 h-5" />
          <span>Add Income</span>
        </button>
        <button
          onClick={() => {
            onAddExpense();
            setIsOpen(false);
          }}
          className="mobile-fab-action"
        >
          <Receipt className="w-5 h-5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Main FAB */}
      <button
        className={`mobile-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </>
  );
}
