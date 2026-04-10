import { PlusCircle, Landmark, ReceiptText, Sparkles, ShieldCheck } from 'lucide-react';

interface RightPanelProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
  onUploadReceipt: () => void;
  healthScore?: number;
  subscriptions?: Array<{ id: string; name: string; amount: number; initial: string }>;
  topSuggestion?: { title: string; description: string } | null;
}

export default function RightPanel({ 
  onAddExpense, 
  onAddIncome, 
  onUploadReceipt,
  healthScore = 0,
  subscriptions = [],
  topSuggestion = null
}: RightPanelProps) {
  return (
    <aside className="w-80 flex-shrink-0 bg-surface h-screen fixed right-0 top-0 flex flex-col p-6 space-y-4 z-40 border-l border-outline-variant/10">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-on-primary-container font-headline">Contextual Intelligence</h3>
        <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Quick Actions & Insights</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onAddExpense}
          className="w-full flex items-center justify-between p-4 bg-on-primary-container text-white rounded-xl shadow-lg shadow-on-primary-container/20 active:scale-95 transition-all group"
        >
          <div className="flex items-center gap-3">
            <PlusCircle className="w-5 h-5" />
            <span className="text-sm font-bold font-headline">Add Expense</span>
          </div>
          <span className="text-[10px] opacity-60 font-bold">E</span>
        </button>

        <button
          onClick={onAddIncome}
          className="w-full flex items-center justify-between p-4 bg-surface-container-lowest text-on-surface rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <Landmark className="w-5 h-5 text-on-surface-variant" />
            <span className="text-sm font-bold font-headline">Add Income</span>
          </div>
          <span className="text-[10px] opacity-40 font-bold">I</span>
        </button>

        <button
          onClick={onUploadReceipt}
          className="w-full flex items-center justify-between p-4 bg-surface-container-lowest text-on-surface rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <ReceiptText className="w-5 h-5 text-on-surface-variant" />
            <span className="text-sm font-bold font-headline">Upload Receipt</span>
          </div>
          <span className="text-[10px] opacity-40 font-bold">OCR</span>
        </button>
      </div>

      <div className="flex-1 space-y-4 pt-4 overflow-y-auto no-scrollbar">
        {topSuggestion && (
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Optimization Suggestion</span>
            </div>
            <p className="text-[11px] leading-relaxed text-on-surface-variant">
              <span className="text-on-surface font-bold">{topSuggestion.title}</span>: {topSuggestion.description}
            </p>
          </div>
        )}

        {healthScore > 0 && (
          <div className="p-4 bg-primary-container text-white rounded-xl relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase opacity-80 mb-1 tracking-widest">Financial Health Score</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-headline font-extrabold">{healthScore}</span>
              </div>
            </div>
            <ShieldCheck className="absolute -right-4 -bottom-4 w-20 h-20 opacity-10 text-white fill-current" />
          </div>
        )}

        {subscriptions.length > 0 && (
          <div className="p-4 glass rounded-xl border border-white/40 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Active Subscriptions</span>
              <span className="text-[10px] text-outline font-bold">{subscriptions.length} TOTAL</span>
            </div>
            <div className="space-y-2">
              {subscriptions.slice(0, 3).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-surface-container-high rounded flex items-center justify-center text-[10px] font-bold text-on-surface">
                      {sub.initial}
                    </div>
                    <span className="text-[11px] font-medium text-on-surface">{sub.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-on-surface">${sub.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
