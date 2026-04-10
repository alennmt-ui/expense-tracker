import { LayoutDashboard, Receipt, Wallet, BarChart3, Settings, CreditCard, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';

interface SidebarProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export default function Sidebar({ activeScreen, onScreenChange }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'income', label: 'Income', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <aside className="w-64 flex-shrink-0 bg-surface-container-low h-screen fixed left-0 top-0 flex flex-col py-8 px-4 z-50">
      <div className="mb-10 px-2">
        <h1 className="text-lg font-bold tracking-tight text-on-surface font-headline">The Fiscal Architect</h1>
        <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mt-1 font-medium">Command Console</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-headline transition-all duration-200 group",
                isActive
                  ? "text-on-primary-container font-bold border-r-2 border-on-primary-container"
                  : "text-on-surface-variant font-medium hover:bg-surface-container-high"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "fill-current" : "")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-2">
        <div className="flex items-center gap-3 p-2 bg-surface-container-lowest rounded-xl shadow-sm">
          <img
            className="w-10 h-10 rounded-lg object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCySWrugkLpBwm2hOD8l_RPPVyT-s2oJaZJBuufk0cIYNjTNliYoKvPWN_GzIHVz5S4VNqOPKb70AudR7aEmFA5Fi6pVC07Z6dThuQDw7BX1P5knirdvpqt-28WPzDEwKvpYCLBr7FUhuhv9_uUzGdAI66sjInVh2jtglghSp4SJtmtgVaxyiXtueJfflslvoCDdUp9YZhZJT4jfrYv6RkkSo_7Stxg0idf8YcIuyiIq0rLLf7XM-azz0HjMSORAqP2e-HjiLsHUyY"
            alt="User Profile"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate text-on-surface">User Profile</p>
            <p className="text-[10px] text-on-surface-variant font-medium">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
