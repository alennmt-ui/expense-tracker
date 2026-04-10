import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as api from '../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Analytics() {
  const [data, setData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ net_savings: 0, avg_daily_spend: 0, savings_rate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const analytics = await api.getAnalytics();
      
      setData(analytics.monthly_trends);
      
      const categories = Object.entries(analytics.category_breakdown).map(([name, value]) => ({
        name,
        value
      }));
      setCategoryData(categories);
      
      setMetrics(analytics.metrics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ml-64 mr-80 flex-1 h-screen overflow-y-auto bg-surface-container-low p-6 no-scrollbar">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <header>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Financial Analytics</h1>
          <p className="text-on-surface-variant">Deep dive into your spending and income patterns.</p>
        </header>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-surface-container-high rounded-3xl p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Net Savings</span>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-headline font-bold text-on-surface">${metrics.net_savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-primary font-bold">Total savings</p>
          </div>
          <div className="bg-surface-container-high rounded-3xl p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Avg. Daily Spend</span>
              <TrendingDown className="w-5 h-5 text-tertiary" />
            </div>
            <p className="text-2xl font-headline font-bold text-on-surface">${metrics.avg_daily_spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-tertiary font-bold">Current month average</p>
          </div>
          <div className="bg-surface-container-high rounded-3xl p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Savings Rate</span>
              <DollarSign className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-2xl font-headline font-bold text-on-surface">{metrics.savings_rate.toFixed(1)}%</p>
            <p className="text-xs text-secondary font-bold">Of total income</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-surface-container-high rounded-3xl p-6 flex flex-col gap-6 chart-card">
            <h3 className="text-lg font-headline font-bold text-on-surface">Income vs Expenses</h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-on-surface-variant">Loading...</div>
            ) : data.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-on-surface-variant">No data available</div>
            ) : (
              <div className="chart-container" style={{ minWidth: 0, width: '100%', height: '256px' }}>
                <ResponsiveContainer width="100%" height={256}>
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0088FE" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF8042" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF8042" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="income" stroke="#0088FE" fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" stroke="#FF8042" fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-surface-container-high rounded-3xl p-6 flex flex-col gap-6 chart-card">
            <h3 className="text-lg font-headline font-bold text-on-surface">Spending by Category</h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-on-surface-variant">Loading...</div>
            ) : categoryData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-on-surface-variant">No expenses yet</div>
            ) : (
              <div className="chart-container" style={{ minWidth: 0, width: '100%', height: '256px' }}>
                <ResponsiveContainer width="100%" height={256}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
