import { useState, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import * as api from '../api';

export default function Settings() {
  const [currency, setCurrency] = useState('USD');
  const [resetDay, setResetDay] = useState('1');
  const [passiveRule, setPassiveRule] = useState('non_salary');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const response = await api.getSettings();
      setCurrency(response.settings.currency || 'USD');
      setResetDay(response.settings.reset_day || '1');
      setPassiveRule(response.settings.passive_rule || 'non_salary');
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);
      await api.updateSettings({
        currency,
        reset_day: resetDay,
        passive_rule: passiveRule,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="ml-64 mr-80 flex-1 h-screen overflow-y-auto bg-surface-container-low p-6 no-scrollbar">
        <div className="max-w-4xl mx-auto">
          <div className="p-12 text-center text-on-surface-variant">Loading settings...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="ml-64 mr-80 flex-1 h-screen overflow-y-auto bg-surface-container-low p-6 no-scrollbar">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <header>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Settings</h1>
          <p className="text-on-surface-variant">Manage your application preferences and configurations.</p>
        </header>

        {/* General Settings */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-on-surface">General</h2>
              <p className="text-xs text-on-surface-variant">Basic application settings</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Currency */}
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-surface-tint/20 text-sm font-medium text-on-surface"
              >
                <option value="USD">USD - US Dollar ($)</option>
                <option value="INR">INR - Indian Rupee (₹)</option>
                <option value="EUR">EUR - Euro (€)</option>
              </select>
            </div>

            {/* Reset Day */}
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Monthly Reset Day</label>
              <select
                value={resetDay}
                onChange={(e) => setResetDay(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-surface-tint/20 text-sm font-medium text-on-surface"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day.toString()}>{day}</option>
                ))}
              </select>
              <p className="text-xs text-on-surface-variant mt-2">Day of the month when your budget resets</p>
            </div>
          </div>
        </div>

        {/* Finance Settings */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-on-surface">Finance</h2>
              <p className="text-xs text-on-surface-variant">Income and expense tracking rules</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Passive Income Rule */}
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Passive Income Rule</label>
              <select
                value={passiveRule}
                onChange={(e) => setPassiveRule(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-surface-tint/20 text-sm font-medium text-on-surface"
              >
                <option value="non_salary">Salary Only Active (others passive)</option>
                <option value="all_passive">All Income Passive</option>
              </select>
              <p className="text-xs text-on-surface-variant mt-2">
                Defines which income sources are considered passive
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          {showSuccess && (
            <div className="flex items-center gap-2 text-sm font-bold text-secondary">
              <CheckCircle className="w-4 h-4" />
              Settings saved
            </div>
          )}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </main>
  );
}
