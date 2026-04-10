import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import * as api from '../../api';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TimeRange = 'day' | 'week' | 'month' | 'year';

interface ChartData {
  name: string;
  income: number;
  expense: number;
}

export default function ChartModal({ isOpen, onClose }: ChartModalProps) {
  const [range, setRange] = useState<TimeRange>('month');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadChartData();
    }
  }, [isOpen, range]);

  async function loadChartData() {
    try {
      setLoading(true);
      const [expenses, income, analytics] = await Promise.all([
        api.getExpenses(),
        api.getIncome(),
        api.getAnalytics()
      ]);

      const data = filterDataByRange(expenses, income, analytics);
      setChartData(data);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterDataByRange(expenses: any[], income: any[], analytics: any): ChartData[] {
    const now = new Date();
    
    switch (range) {
      case 'day':
        return generateDailyData(expenses, income, 7);
      case 'week':
        return generateWeeklyData(expenses, income, 4);
      case 'year':
        return generateYearlyData(expenses, income, 3);
      default: // month
        return analytics.monthly_trends.map((trend: any) => ({
          name: trend.month,
          income: trend.income,
          expense: trend.expense
        }));
    }
  }

  function generateDailyData(expenses: any[], income: any[], days: number): ChartData[] {
    const data: ChartData[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayExpenses = expenses.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.amount, 0);
      const dayIncome = income.filter(i => i.date === dateStr).reduce((sum, i) => sum + i.amount, 0);
      
      data.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        income: dayIncome,
        expense: dayExpenses
      });
    }
    
    return data;
  }

  function generateWeeklyData(expenses: any[], income: any[], weeks: number): ChartData[] {
    const data: ChartData[] = [];
    const now = new Date();
    
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= weekStart && expenseDate <= weekEnd;
      }).reduce((sum, e) => sum + e.amount, 0);
      
      const weekIncome = income.filter(i => {
        const incomeDate = new Date(i.date);
        return incomeDate >= weekStart && incomeDate <= weekEnd;
      }).reduce((sum, i) => sum + i.amount, 0);
      
      data.push({
        name: `Week ${weeks - i}`,
        income: weekIncome,
        expense: weekExpenses
      });
    }
    
    return data;
  }

  function generateYearlyData(expenses: any[], income: any[], years: number): ChartData[] {
    const data: ChartData[] = [];
    const now = new Date();
    
    for (let i = years - 1; i >= 0; i--) {
      const year = now.getFullYear() - i;
      
      const yearExpenses = expenses.filter(e => new Date(e.date).getFullYear() === year)
        .reduce((sum, e) => sum + e.amount, 0);
      const yearIncome = income.filter(i => new Date(i.date).getFullYear() === year)
        .reduce((sum, i) => sum + i.amount, 0);
      
      data.push({
        name: year.toString(),
        income: yearIncome,
        expense: yearExpenses
      });
    }
    
    return data;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-3xl w-full max-w-4xl h-auto max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
          <h2 className="text-xl font-headline font-bold text-on-surface">Income vs Expenses</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors flex items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Time Range Toggle */}
        <div className="p-6 pb-4">
          <div className="flex bg-surface-container-low rounded-full p-1 w-fit">
            {(['day', 'week', 'month', 'year'] as TimeRange[]).map((timeRange) => (
              <button
                key={timeRange}
                onClick={() => setRange(timeRange)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all capitalize ${
                  range === timeRange
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {timeRange}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="px-6 pb-6">
          <div className="h-96 w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full text-on-surface-variant">
                Loading chart data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#f9fafb'
                    }}
                    formatter={(value: number, name: string) => [
                      `$${value.toLocaleString()}`,
                      name === 'income' ? 'Income' : 'Expenses'
                    ]}
                  />
                  <Line 
                    type="monotone"
                    dataKey="income"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone"
                    dataKey="expense"
                    stroke="#F97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}