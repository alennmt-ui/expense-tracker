import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';
import * as api from '../api';
import { Screen } from '../types';

interface Suggestion {
  title: string;
  description: string;
  type: string;
  impact: string;
}

interface InsightsProps {
  onNavigate: (screen: Screen) => void;
}

export default function Insights({ onNavigate }: InsightsProps) {
  const [healthScore, setHealthScore] = useState(0);
  const [topCategory, setTopCategory] = useState({ name: '', amount: 0, percentage: 0 });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    try {
      setLoading(true);
      const insights = await api.getInsights();
      setHealthScore(insights.health_score);
      setTopCategory(insights.top_category);
      setSuggestions(insights.suggestions);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleTakeAction = (title: string) => {
    if (title.includes('High Category Spending') || title.includes('Category Spending')) {
      onNavigate('expenses');
    } else if (title.includes('Excellent Savings') || title.includes('Savings Rate')) {
      onNavigate('analytics');
    } else if (title.includes('Subscription')) {
      onNavigate('subscriptions');
    } else {
      onNavigate('analytics');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Sparkles className="w-6 h-6" />;
      case 'opportunity': return <TrendingUp className="w-6 h-6" />;
      case 'audit': return <AlertCircle className="w-6 h-6" />;
      case 'tax': return <Lightbulb className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'optimization': return 'bg-primary/20 text-primary';
      case 'opportunity': return 'bg-secondary/20 text-secondary';
      case 'audit': return 'bg-tertiary/20 text-tertiary';
      case 'tax': return 'bg-error/20 text-error';
      default: return 'bg-primary/20 text-primary';
    }
  };

  return (
    <main className="ml-64 mr-80 flex-1 h-screen overflow-y-auto bg-surface-container-low p-6 no-scrollbar">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <header>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Financial Insights</h1>
          <p className="text-on-surface-variant">AI-powered suggestions to optimize your financial health.</p>
        </header>

        {loading ? (
          <div className="p-12 text-center text-on-surface-variant">Loading insights...</div>
        ) : (
          <>
            <div className="bg-primary/10 border border-primary/20 rounded-3xl p-8 flex items-center gap-8">
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="text-4xl font-headline font-bold text-primary">{healthScore}</div>
                  <div className="text-xs font-bold text-primary uppercase">Score</div>
                </div>
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-primary/20"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - healthScore / 100)}`}
                    className="text-primary transition-all duration-1000"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-headline font-bold text-on-surface">Financial Health Score</h3>
                <p className="text-on-surface-variant mt-2">
                  {healthScore >= 80 ? 'Excellent! Your finances are in great shape.' :
                   healthScore >= 60 ? 'Good progress. A few improvements could boost your score.' :
                   healthScore >= 40 ? 'Fair. Focus on the suggestions below to improve.' :
                   'Needs attention. Review the suggestions to get back on track.'}
                </p>
                {topCategory.name !== 'None' && (
                  <p className="text-sm text-on-surface-variant mt-4">
                    <span className="font-bold text-on-surface">{topCategory.name}</span> is your top spending category at ${topCategory.amount.toFixed(2)} ({topCategory.percentage.toFixed(1)}% of expenses)
                  </p>
                )}
              </div>
            </div>

            {suggestions.length === 0 ? (
              <div className="bg-surface-container-high rounded-3xl p-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-headline font-bold text-on-surface">All Good!</h3>
                <p className="text-on-surface-variant mt-2">No immediate actions needed. Keep up the great work!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {suggestions.map((insight, index) => (
                  <div key={index} className="bg-surface-container-high rounded-3xl p-6 flex flex-col gap-6 border border-surface-container-highest hover:border-primary/30 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getTypeColor(insight.type)}`}>
                        {getIcon(insight.type)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                          insight.impact === 'High' ? 'bg-error/10 text-error' : 
                          insight.impact === 'Medium' ? 'bg-secondary/10 text-secondary' :
                          'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                          {insight.impact} Impact
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-headline font-bold text-on-surface">{insight.title}</h3>
                      <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{insight.description}</p>
                    </div>

                    <button 
                      onClick={() => handleTakeAction(insight.title)}
                      className="mt-auto flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all cursor-pointer hover:text-primary/80"
                    >
                      Take Action
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-primary/10 border border-primary/20 rounded-3xl p-8 flex items-center gap-8">
              <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-headline font-bold text-on-surface">AI Financial Advisor</h3>
                <p className="text-on-surface-variant mt-2">Insights are generated based on your spending patterns and financial data. Add more transactions to get personalized recommendations.</p>
              </div>
              <button 
                onClick={loadInsights}
                className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-colors"
              >
                Refresh Insights
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
