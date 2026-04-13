/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import Dashboard from './components/Dashboard';
import Analytics from './pages/Analytics';
import Subscriptions from './pages/Subscriptions';
import Insights from './pages/Insights';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import AddExpenseModal from './components/Modals/AddExpenseModal';
import AddIncomeModal from './components/Modals/AddIncomeModal';
import ScanReceiptModal from './components/Modals/ScanReceiptModal';
import SetLimitModal from './components/Modals/SetLimitModal';
import { Screen, Transaction } from './types';
import { INITIAL_SUMMARY, DashboardSummary } from './constants';
import * as api from './api';

interface DashboardData {
  categoryData: { name: string; value: number; color: string }[];
  trendData: { name: number; value: number; active: boolean }[];
  healthScore: number;
  subscriptions: any[];
  topSuggestion: { title: string; description: string } | null;
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isScanReceiptOpen, setIsScanReceiptOpen] = useState(false);
  const [isSetLimitOpen, setIsSetLimitOpen] = useState(false);

  // Dashboard Data State
  const [summary, setSummary] = useState<DashboardSummary>(INITIAL_SUMMARY);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    categoryData: [],
    trendData: [],
    healthScore: 0,
    subscriptions: [],
    topSuggestion: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      
      // Use Promise.allSettled to prevent crash if some endpoints fail
      const results = await Promise.allSettled([
        api.getSummary(),
        api.getExpenses(),
        api.getIncome(),
        api.getAnalytics(),
        api.getInsights(),
        api.getSubscriptions(),
      ]);

      // Extract successful results or use fallbacks
      const summaryData = results[0].status === 'fulfilled' ? results[0].value : { total_income: 0, total_expense: 0, balance: 0, monthly_limit: null, remaining: null, limit_exceeded: false };
      const expenses = results[1].status === 'fulfilled' ? results[1].value : [];
      const income = results[2].status === 'fulfilled' ? results[2].value : [];
      const analytics = results[3].status === 'fulfilled' ? results[3].value : { category_breakdown: {}, monthly_trends: [], metrics: { net_savings: 0, avg_daily_spend: 0, savings_rate: 0 } };
      const insights = results[4].status === 'fulfilled' ? results[4].value : { health_score: 0, top_category: { name: 'None', amount: 0, percentage: 0 }, suggestions: [] };
      const subscriptions = results[5].status === 'fulfilled' ? results[5].value : [];

      // Log failed endpoints
      if (results[0].status === 'rejected') console.error('Failed to load summary:', results[0].reason);
      if (results[1].status === 'rejected') console.error('Failed to load expenses:', results[1].reason);
      if (results[2].status === 'rejected') console.error('Failed to load income:', results[2].reason);
      if (results[3].status === 'rejected') console.warn('Analytics endpoint not available:', results[3].reason);
      if (results[4].status === 'rejected') console.warn('Insights endpoint not available:', results[4].reason);
      if (results[5].status === 'rejected') console.warn('Subscriptions endpoint not available:', results[5].reason);

      console.log('RAW SUMMARY:', summaryData);
      console.log('RAW INCOME DATA:', income);

      // Calculate passive income (income where category !== "Salary")
      const passiveIncome = income
        .filter(i => i.category !== 'Salary')
        .reduce((sum, i) => sum + i.amount, 0);

      // Calculate fixed costs (sum of active subscriptions)
      const fixedCosts = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.amount, 0);

      // Calculate percentages
      const totalIncome = summaryData.total_income || 0;
      const passivePercent = totalIncome > 0 ? Math.round((passiveIncome / totalIncome) * 100) : 0;
      const fixedCostPercent = totalIncome > 0 ? Math.round((fixedCosts / totalIncome) * 100) : 0;

      // Adapt subscriptions for UI
      const adaptedSubscriptions = subscriptions.map(api.adaptSubscription);

      const adaptedSummary = api.adaptSummaryToDashboard(summaryData);
      console.log('ADAPTED SUMMARY:', adaptedSummary);

      const finalSummary = { 
        ...INITIAL_SUMMARY,
        ...adaptedSummary,
        passiveIncome,
        fixedCosts,
        passivePercent,
        fixedCostPercent,
      };
      console.log('FINAL SUMMARY:', finalSummary);

      setSummary(finalSummary);
      
      const allTransactions = [
        ...expenses.map(api.adaptExpenseToTransaction),
        ...income.map(api.adaptIncomeToTransaction),
      ].sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
      
      setTransactions(allTransactions);

      // Transform analytics data for Dashboard
      const categoryColors: Record<string, string> = {
        'Housing': '#00174b',
        'Food': '#006c49',
        'Groceries': '#006c49',
        'Dining': '#006c49',
        'Transport': '#497cff',
        'Travel': '#497cff',
        'Utilities': '#ba1a1a',
        'Shopping': '#e0e3e5',
        'Entertainment': '#e0e3e5',
      };

      console.log('CATEGORY DATA:', analytics.category_breakdown);

      const categoryBreakdown = Object.entries(analytics.category_breakdown);
      const totalExpense = categoryBreakdown.reduce((sum, [_, amount]) => sum + amount, 0);
      
      const categoryData = categoryBreakdown.map(([name, amount]) => ({
        name,
        value: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        color: categoryColors[name] || '#e0e3e5',
      }));

      // Transform monthly trends to efficiency trend (last 20 data points)
      const trendData = analytics.monthly_trends.flatMap((trend, idx) => {
        const daysInMonth = 30;
        const dailyAvg = trend.expense / daysInMonth;
        return Array.from({ length: Math.floor(daysInMonth / 1.5) }, (_, i) => ({
          name: idx * 20 + i,
          value: Math.max(20, dailyAvg + (Math.random() - 0.5) * dailyAvg * 0.3),
          active: idx >= analytics.monthly_trends.length - 2,
        }));
      }).slice(-20);

      setDashboardData({
        categoryData: categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 100, color: '#e0e3e5' }],
        trendData: trendData.length > 0 ? trendData : Array.from({ length: 20 }, (_, i) => ({ name: i, value: 50, active: false })),
        healthScore: insights.health_score,
        subscriptions: adaptedSubscriptions,
        topSuggestion: insights.suggestions.length > 0 ? insights.suggestions[0] : null,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  // OCR Prefill State
  const [prefillData, setPrefillData] = useState<{ merchant?: string; amount?: number; date?: string }>({});

  const handleAddExpense = async (newExpense: Omit<Transaction, 'id' | 'type'>, id?: string) => {
    try {
      const payload = api.adaptExpensePayload({
        merchant: newExpense.merchant,
        amount: newExpense.amount,
        date: newExpense.date || new Date().toISOString().split('T')[0],
        category: newExpense.category,
      });
      
      await api.createExpense(payload);
      await loadData();
      setIsAddExpenseOpen(false);
      setPrefillData({});
    } catch (error) {
      console.error('Failed to add expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleAddIncome = async (newIncome: Omit<Transaction, 'id' | 'type'>) => {
    try {
      const payload = api.adaptIncomePayload({
        source: newIncome.merchant,
        amount: newIncome.amount,
        date: newIncome.date || new Date().toISOString().split('T')[0],
        category: newIncome.category,
      });
      
      await api.createIncome(payload);
      await loadData();
      setIsAddIncomeOpen(false);
    } catch (error) {
      console.error('Failed to add income:', error);
      alert('Failed to add income. Please try again.');
    }
  };

  const handleOCRComplete = (data: { merchant: string; amount: number; date: string }) => {
    setPrefillData({
      merchant: data.merchant,
      amount: data.amount,
      date: data.date,
    });
    setIsScanReceiptOpen(false);
    setIsAddExpenseOpen(true);
  };

  const handleUpdateLimit = async (limit: number) => {
    try {
      await api.setLimit(limit);
      await loadData();
      setIsSetLimitOpen(false);
    } catch (error) {
      console.error('Failed to update limit:', error);
      alert('Failed to update limit. Please try again.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await api.deleteExpense(parseInt(id));
      await loadData();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense.');
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      await api.deleteIncome(parseInt(id));
      await loadData();
    } catch (error) {
      console.error('Failed to delete income:', error);
      alert('Failed to delete income.');
    }
  };

  console.log('APP SUMMARY STATE:', summary);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar 
        activeScreen={activeScreen} 
        onScreenChange={setActiveScreen} 
      />

      <div className="flex-1 flex overflow-hidden">
        {activeScreen === 'dashboard' && (
          <Dashboard 
            summary={summary}
            transactions={transactions}
            categoryData={dashboardData.categoryData}
            trendData={dashboardData.trendData}
            healthScore={dashboardData.healthScore}
            subscriptions={dashboardData.subscriptions}
            topSuggestion={dashboardData.topSuggestion}
            onEditLimit={() => setIsSetLimitOpen(true)} 
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 'analytics' && <Analytics />}
        {activeScreen === 'subscriptions' && <Subscriptions />}
        {activeScreen === 'insights' && <Insights onNavigate={setActiveScreen} />}
        {activeScreen === 'expenses' && (
          <Expenses 
            expenses={transactions.filter(t => t.type === 'expense')}
            onAddExpense={() => {
              setPrefillData({});
              setIsAddExpenseOpen(true);
            }} 
            onEditExpense={(expense) => {
              setPrefillData({
                id: expense.id,
                merchant: expense.merchant,
                amount: Math.abs(expense.amount),
                date: expense.date || expense.time,
                category: expense.category
              });
              setIsAddExpenseOpen(true);
            }}
            onDelete={handleDeleteExpense}
          />
        )}
        {activeScreen === 'income' && (
          <Income 
            income={transactions.filter(t => t.type === 'income')}
            onAddIncome={() => setIsAddIncomeOpen(true)} 
            onDelete={handleDeleteIncome}
          />
        )}
        
        {['settings'].includes(activeScreen) && (
          <main className="ml-64 mr-80 flex-1 h-screen bg-surface-container-low p-6 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-headline font-bold text-on-surface">
                {activeScreen.charAt(0).toUpperCase() + activeScreen.slice(1)}
              </h2>
              <p className="text-on-surface-variant mt-2">This module is currently under construction.</p>
            </div>
          </main>
        )}

        <RightPanel 
          onAddExpense={() => {
            setPrefillData({});
            setIsAddExpenseOpen(true);
          }}
          onAddIncome={() => setIsAddIncomeOpen(true)}
          onUploadReceipt={() => setIsScanReceiptOpen(true)}
          healthScore={dashboardData.healthScore}
          subscriptions={dashboardData.subscriptions}
          topSuggestion={dashboardData.topSuggestion}
        />
      </div>

      {/* Modals */}
      <AddExpenseModal 
        isOpen={isAddExpenseOpen} 
        onClose={() => {
          setIsAddExpenseOpen(false);
          setPrefillData({});
        }}
        onAdd={handleAddExpense}
        prefill={prefillData}
      />
      <AddIncomeModal 
        isOpen={isAddIncomeOpen} 
        onClose={() => setIsAddIncomeOpen(false)}
        onAdd={handleAddIncome}
      />
      <ScanReceiptModal 
        isOpen={isScanReceiptOpen} 
        onClose={() => setIsScanReceiptOpen(false)}
        onComplete={handleOCRComplete}
      />
      <SetLimitModal 
        isOpen={isSetLimitOpen} 
        onClose={() => setIsSetLimitOpen(false)}
        currentLimit={summary.spendingLimit}
        onUpdate={handleUpdateLimit}
      />
    </div>
  );
}
