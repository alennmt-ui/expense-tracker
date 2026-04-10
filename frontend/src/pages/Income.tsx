import { Plus, Trash2 } from 'lucide-react';
import { Transaction } from '../types';

interface IncomeProps {
  income: Transaction[];
  onAddIncome: () => void;
  onDelete: (id: string) => void;
}

export default function Income({ income, onAddIncome, onDelete }: IncomeProps) {
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this income?')) return;
    onDelete(id);
  };

  return (
    <main className="ml-64 mr-80 flex-1 h-screen overflow-y-auto bg-surface-container-low p-6 no-scrollbar">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Income</h1>
            <p className="text-sm text-on-surface-variant font-medium">Manage your incoming fiscal streams and revenue logs.</p>
          </div>
          <button 
            onClick={onAddIncome}
            className="bg-gradient-to-r from-on-primary-container to-surface-tint text-on-primary px-6 py-2.5 rounded-xl font-bold text-xs tracking-widest flex items-center gap-2 shadow-lg shadow-on-primary-container/20 active:opacity-70 transition-all"
          >
            <Plus className="w-5 h-5" />
            ADD INCOME
          </button>
        </header>

        <div className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="grid grid-cols-5 bg-surface-container-high border-b border-outline-variant/15 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <div>Date</div>
            <div className="col-span-2">Source</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="flex-1">
            {income.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                No income found. Add your first income to get started.
              </div>
            ) : (
              income.map((tx) => (
                <div key={tx.id} className="grid grid-cols-5 px-6 py-3 items-center hover:bg-surface-container-high transition-colors group border-b border-outline-variant/5 last:border-0">
                  <div className="text-xs font-medium text-on-surface-variant">{tx.date || tx.time}</div>
                  <div className="col-span-2 text-xs font-bold text-on-surface">{tx.merchant}</div>
                  <div className="text-xs font-bold text-secondary text-right">
                    +${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-right">
                    <button 
                      onClick={() => handleDelete(tx.id)}
                      className="material-symbols-outlined text-error opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-error-container rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
