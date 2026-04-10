import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Plus, Trash2, Edit2 } from 'lucide-react';
import * as api from '../api';
import AddSubscriptionModal from '../components/Modals/AddSubscriptionModal';

interface Subscription {
  id: number;
  name: string;
  amount: number;
  billing_date: number;
  category: string;
  status: string;
  created_at: string;
}

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    try {
      setLoading(true);
      const data = await api.getSubscriptions();
      setSubscriptions(data.filter(s => s.status === 'active'));
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(data: { name: string; amount: number; billing_date: number; category: string }) {
    try {
      await api.createSubscription({
        ...data,
        status: 'active',
      });
      await loadSubscriptions();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add subscription:', error);
      alert('Failed to add subscription');
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;
    
    try {
      await api.deleteSubscription(id);
      await loadSubscriptions();
    } catch (error) {
      console.error('Failed to delete subscription:', error);
      alert('Failed to delete subscription');
    }
  }

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  
  const getInitial = (name: string) => name.charAt(0).toUpperCase();
  
  const getOrdinal = (day: number) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };

  return (
    <main className="ml-64 mr-80 flex-1 h-screen overflow-y-auto bg-surface-container-low p-6 no-scrollbar">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold text-on-surface">Active Subscriptions</h1>
            <p className="text-on-surface-variant">Manage your recurring payments and digital services.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Subscription
          </button>
        </header>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Total Monthly Cost</p>
              <p className="text-3xl font-headline font-bold text-on-surface">${totalMonthly.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-secondary/10 border border-secondary/20 rounded-3xl p-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Active Services</p>
              <p className="text-3xl font-headline font-bold text-on-surface">{subscriptions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-high rounded-3xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              No active subscriptions. Click "Add Subscription" to get started.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest/50">
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Service</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Billing Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-t border-surface-container-highest hover:bg-surface-container-highest/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface font-bold">
                          {getInitial(sub.name)}
                        </div>
                        <span className="text-sm font-bold text-on-surface">{sub.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{sub.category}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{getOrdinal(sub.billing_date)} of month</td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">${sub.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(sub.id)}
                          className="p-2 text-on-surface-variant hover:text-error transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
      />
    </main>
  );
}
