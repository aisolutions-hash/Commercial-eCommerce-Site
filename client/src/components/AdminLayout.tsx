import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ShoppingCart, MessageSquare, ExternalLink, LogOut } from 'lucide-react';
import { useStore } from '../store';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: Tags, label: 'Categories' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/inquiries', icon: MessageSquare, label: 'Inquiries' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useStore((s) => s.logout);

  const isActive = (item: typeof navItems[number]) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 bg-card border-r border-border p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xl shrink-0">K</div>
          <div>
            <p className="font-bold text-lg tracking-tight leading-tight">KaliSoft AI</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-3xl text-sm font-medium transition-colors ${
                isActive(item) ? 'bg-primary text-black' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 pt-4 border-t border-border mt-4">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-3xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ExternalLink className="w-5 h-5" /> View Store
          </Link>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-3xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 lg:p-10 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}
