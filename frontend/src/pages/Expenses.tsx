import { Plus, Trash2, Edit2, ShoppingCart, Zap, Briefcase, Car, Utensils, Cloud, Globe, Terminal, Building2, Bolt, ShoppingBag, Truck, Shield, Coffee, Server } from 'lucide-react';
import { Transaction } from '../types';
import { cn } from '../lib/utils';

interface ExpensesProps {
  expenses: Transaction[];
  onAddExpense: () => void;
  onEditExpense: (expense: Transaction) => void;
  onDelete: (id: string) => void;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'shopping_cart': return <ShoppingCart className="w-4 h-4" />;
    case 'zap': return <Zap className="w-4 h-4" />;
    case 'briefcase': return <Briefcase className="w-4 h-4" />;
    case 'car': return <Car className="w-4 h-4" />;
    case 'utensils': return <Utensils className="w-4 h-4" />;
    case 'cloud': return <Cloud className="w-4 h-4" />;
    case 'restaurant': return <Utensils className="w-4 h-4" />;
    case 'travel_explore': return <Globe className="w-4 h-4" />;
    case 'terminal': return <Terminal className="w-4 h-4" />;
    case 'home_work': return <Building2 className="w-4 h-4" />;
    case 'bolt': return <Bolt className="w-4 h-4" />;
    case 'shopping_bag': return <ShoppingBag className="w-4 h-4" />;
    case 'local_shipping': return <Truck className="w-4 h-4" />;
    case 'shield': return <Shield className="w-4 h-4" />;
    case 'directions_car': return <Car className="w-4 h-4" />;
    case 'coffee': return <Coffee className="w-4 h-4" />;
    case 'dns': return <Server className="w-4 h-4" />;
    default: return <ShoppingCart className="w-4 h-4" />;
  }
};

export default function Expenses({ expenses, onAddExpense, onEditExpense, onDelete }: ExpensesProps) {
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    onDelete(id);
  };

  return (
    <main className="ml-64 mr-80 flex-1 h-screen overflow-y-auto bg-surface-container-low p-6 no-scrollbar">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Expenses</h1>
            <p className="text-sm text-on-surface-variant font-medium">Monitoring outflows across all primary entities.</p>
          </div>
          <button 
            onClick={onAddExpense}
            className="bg-primary hover:bg-surface-tint text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-primary/10"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        </header>

        <div className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container-highest/30 border-b border-outline-variant/10 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            <div className="col-span-2">Date</div>
            <div className="col-span-4">Merchant</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="flex-1">
            {expenses.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                No expenses found. Add your first expense to get started.
              </div>
            ) : (
              expenses.map((tx) => (
                <div key={tx.id} className="grid grid-cols-12 gap-4 px-6 py-3.5 items-center hover:bg-surface-container-low transition-colors group border-b border-outline-variant/5 last:border-0">
                  <div className="col-span-2 text-xs font-medium text-on-surface-variant">{tx.date || tx.time}</div>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                      {getIcon(tx.icon)}
                    </div>
                    <span className="text-sm font-bold text-on-surface">{tx.merchant}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="px-2 py-1 bg-surface-container rounded-md text-[10px] font-bold uppercase text-on-surface-variant">
                      {tx.category}
                    </span>
                  </div>
                  <div className="col-span-2 text-right font-headline font-bold text-error">
                    -${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="col-span-2 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEditExpense(tx)}
                      className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(tx.id)}
                      className="p-1.5 rounded-lg hover:bg-error-container text-error"
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
