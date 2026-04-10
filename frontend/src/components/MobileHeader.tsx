import { Menu } from 'lucide-react';

export default function MobileHeader() {
  return (
    <header className="mobile-header">
      <div className="mobile-header-content">
        <div>
          <h1 className="mobile-header-title">Fiscal Architect</h1>
          <p className="mobile-header-subtitle">Command Console</p>
        </div>
        <img
          className="mobile-header-avatar"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCySWrugkLpBwm2hOD8l_RPPVyT-s2oJaZJBuufk0cIYNjTNliYoKvPWN_GzIHVz5S4VNqOPKb70AudR7aEmFA5Fi6pVC07Z6dThuQDw7BX1P5knirdvpqt-28WPzDEwKvpYCLBr7FUhuhv9_uUzGdAI66sjInVh2jtglghSp4SJtmtgVaxyiXtueJfflslvoCDdUp9YZhZJT4jfrYv6RkkSo_7Stxg0idf8YcIuyiIq0rLLf7XM-azz0HjMSORAqP2e-HjiLsHUyY"
          alt="User"
          referrerPolicy="no-referrer"
        />
      </div>
    </header>
  );
}
