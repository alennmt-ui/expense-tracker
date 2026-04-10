import { Subscription } from '../types';

interface SubscriptionsListProps {
  subscriptions: Subscription[];
  onClick?: () => void;
}

export default function SubscriptionsList({ subscriptions, onClick }: SubscriptionsListProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-surface-container-high rounded-3xl p-6 flex flex-col gap-4 cursor-pointer hover:bg-surface-container-highest transition-colors"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-headline font-bold text-on-surface">Active Subscriptions</h3>
        <span className="text-xs font-bold text-primary uppercase tracking-widest">View All</span>
      </div>
      <div className="flex flex-col gap-4">
        {subscriptions.slice(0, 3).map((sub) => (
          <div key={sub.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface font-bold">
                {sub.initial}
              </div>
              <span className="text-sm font-bold text-on-surface">{sub.name}</span>
            </div>
            <span className="text-sm font-bold text-on-surface">${sub.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
