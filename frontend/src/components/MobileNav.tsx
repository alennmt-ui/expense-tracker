import { LayoutDashboard, Receipt, Wallet, BarChart3, Settings, CreditCard, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';

interface MobileNavProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export default function MobileNav({ activeScreen, onScreenChange }: MobileNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'income', label: 'Income', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onScreenChange(item.id)}
            className={cn(isActive && 'active')}
          >
            <Icon />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
