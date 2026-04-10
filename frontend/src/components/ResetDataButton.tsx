import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import * as api from '../api';

interface ResetDataButtonProps {
  onResetComplete: () => void;
}

export default function ResetDataButton({ onResetComplete }: ResetDataButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    try {
      setResetting(true);
      
      // Get all data to delete
      const [expenses, income] = await Promise.all([
        api.getExpenses(),
        api.getIncome()
      ]);

      // Delete all expenses
      await Promise.all(expenses.map(expense => api.deleteExpense(expense.id)));
      
      // Delete all income
      await Promise.all(income.map(incomeItem => api.deleteIncome(incomeItem.id)));

      // Reset limit
      await api.setLimit(0);

      onResetComplete();
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to reset data:', error);
      alert('Failed to reset data. Please try again.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors flex items-center justify-center text-on-surface-variant hover:text-error group"
        title="Reset all data"
      >
        <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
      </button>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-2">Reset All Data?</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              This will permanently delete all expenses, income, and reset your spending limit. This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={resetting}
                className="px-4 py-2 rounded-full text-sm font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-2 rounded-full text-sm font-bold bg-error text-on-error hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetting ? 'Resetting...' : 'Reset All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}