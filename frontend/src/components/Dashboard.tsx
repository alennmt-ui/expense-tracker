import { TrendingUp, Landmark, ShoppingCart, Zap, Briefcase, Car, Utensils, Edit2, Lock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Transaction, Screen } from '../types';
import { cn } from '../lib/utils';
import { DashboardSummary } from '../constants';
import PassiveIncomeCard from './PassiveIncomeCard';
import FixedCostsCard from './FixedCostsCard';
import OptimizationSuggestion from './OptimizationSuggestion';
import FinancialHealthScore from './FinancialHealthScore';
import SubscriptionsList from './SubscriptionsList';

interface DashboardProps {
  summary: DashboardSummary;
  transactions: Transaction[];
  categoryData: { name: string; value: number; color: string }[];
  trendData: { name: number; value: number; active: boolean }[];
  healthScore: number;
  subscriptions: any[];
  topSuggestion: { title: string; description: string } | null;
  onEditLimit: () => void;
  onNavigate: (screen: Screen) => void;
}

export default function Dashboard({ 
  summary, 
  transactions, 
  categoryData,
  trendData,
  healthScore,
  subscriptions,
  topSuggestion,
  onEditLimit, 
  onNavigate 
}: DashboardProps) {
  console.log('DASHBOARD RECEIVED:', summary);
  
  // Find top category for center display
  const topCategory = categoryData.length > 0 
    ? categoryData.reduce((max, cat) => cat.value > max.value ? cat : max, categoryData[0])
    : { name: 'No Data', value: 0 };
  return (
    <main className="ml-64 mr-80 flex-1 h-screen bg-surface-container-low p-6 flex flex-col gap-4 overflow-hidden">
      {/* ROW 1: Balance & Summaries */}
      <div className="h-40 flex gap-4 shrink-0">
        <div className="flex-[2] bg-surface-container-lowest rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Net Worth</span>
            <h2 className="text-3xl font-extrabold font-headline text-on-surface mt-1">
              ${summary.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex flex-col">
              <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Monthly In</span>
              <span className="text-sm font-bold text-on-surface">
                +${summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-error font-bold uppercase tracking-wider">Monthly Out</span>
              <span className="text-sm font-bold text-on-surface">
                -${summary.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <PassiveIncomeCard 
            amount={summary.passiveIncome}
            percent={summary.passivePercent}
            onClick={() => onNavigate('analytics')} 
          />
          <FixedCostsCard 
            amount={summary.fixedCosts}
            percent={summary.fixedCostPercent}
            onClick={() => onNavigate('expenses')} 
          />
        </div>
      </div>

      {/* ROW 2: Spending Limit Bar */}
      <div className="h-[72px] bg-surface-container-lowest rounded-xl p-4 flex flex-col justify-center gap-2 shrink-0 shadow-sm relative group">
        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-tight">
          <span className="text-on-surface-variant">Monthly Spending Limit</span>
          <div className="flex gap-2">
            <span className="text-on-primary-container">{summary.consumedPercent}% Consumed</span>
            <span className="text-outline">Remaining: ${summary.remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden">
          <div 
            className="bg-on-primary-container h-full rounded-full transition-all duration-500" 
            style={{ width: `${summary.consumedPercent}%` }}
          />
        </div>
        <button 
          onClick={onEditLimit}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-on-surface-variant hover:text-on-surface"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>

      {/* ROW 3: Category Chart & Recent Transactions */}
      <div className="h-[260px] flex gap-4 shrink-0 overflow-hidden">
        <div className="w-64 bg-surface-container-lowest rounded-xl p-5 flex flex-col shadow-sm">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Allocation by Category</span>
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-on-surface">{topCategory.name}</span>
              <span className="text-[10px] text-outline font-bold">{topCategory.value}%</span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Recent Intelligence</span>
            <button className="text-[10px] text-surface-tint font-bold hover:underline">VIEW ALL</button>
          </div>
          <div className="mb-3">
            {topSuggestion ? (
              <OptimizationSuggestion 
                title={topSuggestion.title}
                description={topSuggestion.description}
                onClick={() => onNavigate('insights')} 
              />
            ) : (
              <OptimizationSuggestion onClick={() => onNavigate('insights')} />
            )}
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-lg transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                    {tx.icon === 'shopping_cart' && <ShoppingCart className="w-4 h-4" />}
                    {tx.icon === 'zap' && <Zap className="w-4 h-4" />}
                    {tx.icon === 'briefcase' && <Briefcase className="w-4 h-4 fill-current" />}
                    {tx.icon === 'car' && <Car className="w-4 h-4" />}
                    {tx.icon === 'utensils' && <Utensils className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">{tx.merchant}</p>
                    <p className="text-[10px] text-outline font-medium">{tx.category} • {tx.time}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-xs font-bold",
                  tx.type === 'expense' ? "text-error" : "text-secondary"
                )}>
                  {tx.type === 'expense' ? '-' : '+'}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 4: Health & Subscriptions */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4">
          <FinancialHealthScore score={healthScore} onClick={() => onNavigate('analytics')} />
          <SubscriptionsList 
            subscriptions={subscriptions} 
            onClick={() => onNavigate('subscriptions')} 
          />
        </div>
      </div>
    </main>
  );
}
