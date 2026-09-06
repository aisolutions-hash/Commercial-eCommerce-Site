import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Package, Tags, ShoppingCart, MessageSquare, Users, ArrowRight, Trash2, TrendingUp, Star, DollarSign, BarChart3, Target, Zap, Contact, Phone, Mail, Building, Calendar, AlertCircle } from 'lucide-react';
import { getProducts, getCategories, Category, ProductRead } from '../lib/api';
import { products as staticProducts, categories as staticCategories } from '../data';

interface OrderItem {
  id: string;
  user_id: string;
  items: { product_id: string; quantity: number; price: number }[];
  total: number;
  status: string;
  created_at: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface UserAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
  auth_method: string;
  order_count: number;
  created_at: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const token = () => { try { const s = JSON.parse(localStorage.getItem('kalisoft-storage')!); return s?.state?.token || null; } catch { return null; } };

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const t = token();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return undefined as T;
  return res.json();
}

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-sm font-semibold capitalize px-3 py-1 rounded-full ${statusColors[status] || 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const tab = useLocation().pathname.split('/')[2] || 'dashboard';
  if (tab === 'dashboard') return <Overview />;
  if (tab === 'products') return <ManageProducts />;
  if (tab === 'categories') return <ManageCategories />;
  if (tab === 'orders') return <ManageOrders />;
  if (tab === 'inquiries') return <ManageInquiries />;
  if (tab === 'users') return <ManageUsers />;
  if (tab === 'sales-contacts') return <SalesContacts />;
  if (tab === 'sales-insights') return <SalesInsights />;
  return <Overview />;
}

function Overview() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, inquiries: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ per_page: 1 }).then(r => setStats(s => ({ ...s, products: r.total }))).catch(() => {}),
      getCategories().then(r => setStats(s => ({ ...s, categories: r.length }))).catch(() => {}),
      api<OrderItem[]>('/admin/orders').then(r => setStats(s => ({ ...s, orders: r.length }))).catch(() => {}),
      api<Inquiry[]>('/admin/inquiries').then(r => setStats(s => ({ ...s, inquiries: r.length }))).catch(() => {}),
      api<UserAdmin[]>('/admin/users').then(r => setStats(s => ({ ...s, users: r.length }))).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Products', value: stats.products, icon: Package, href: '/admin/products', color: 'bg-blue-500' },
    { label: 'Categories', value: stats.categories, icon: Tags, href: '/admin/categories', color: 'bg-green-500' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, href: '/admin/orders', color: 'bg-purple-500' },
    { label: 'Inquiries', value: stats.inquiries, icon: MessageSquare, href: '/admin/inquiries', color: 'bg-orange-500' },
    { label: 'Users', value: stats.users || 0, icon: Users, href: '/admin/users', color: 'bg-teal-500' },
  ];

  if (loading) return <Spinner />;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-3xl font-serif font-bold tracking-tight mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(c => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Link to={c.href} className="block bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
              <div className={`w-12 h-12 rounded-2xl ${c.color} flex items-center justify-center mb-4`}>
                <c.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold">{c.value}</p>
              <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
                {c.label}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ManageProducts() {
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getProducts({ per_page: 100 }).then(r => setProducts(r.items)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api(`/admin/products/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Products</h1>
        <span className="text-sm text-muted-foreground">{products.length} total</span>
      </div>

      {loading ? <Spinner /> : products.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-8 text-center text-muted-foreground shadow-sm">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium text-lg text-foreground">No products found.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Category</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Rating</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? 'bg-background/50' : ''}`}>
                    <td className="p-4 font-medium">{p.name}</td>
                    <td className="p-4">Rs. {p.price.toFixed(2)}</td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">{p.category_id}</td>
                    <td className="p-4 hidden md:table-cell">{p.rating.toFixed(1)} ★</td>
                    <td className="p-4 text-right">
                      <button onClick={() => remove(p.id)} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 ml-auto">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => getCategories().then(setCategories).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await api(`/admin/categories/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Categories</h1>
        <span className="text-sm text-muted-foreground">{categories.length} total</span>
      </div>

      {loading ? <Spinner /> : categories.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-8 text-center text-muted-foreground shadow-sm">
          <Tags className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium text-lg text-foreground">No categories found.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Section</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c, i) => (
                  <tr key={c.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? 'bg-background/50' : ''}`}>
                    <td className="p-4 font-medium">{c.name}</td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell capitalize">{c.section || '—'}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => remove(c.id)} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 ml-auto">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ManageOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => api<OrderItem[]>('/admin/orders').then(setOrders).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await api(`/admin/orders/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PUT' });
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Orders</h1>
        <span className="text-sm text-muted-foreground">{orders.length} total</span>
      </div>

      {loading ? <Spinner /> : orders.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-8 text-center text-muted-foreground shadow-sm">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium text-lg text-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-lg">Order #{o.id.slice(0, 8)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString()} — {o.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-xl">Rs. {Number(o.total).toFixed(2)}</span>
                  <select
                    value={o.status}
                    onChange={e => updateStatus(o.id, e.target.value)}
                    className="text-sm border border-border rounded-full px-4 py-2 bg-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ManageInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => api<Inquiry[]>('/admin/inquiries').then(setInquiries).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    await api(`/admin/inquiries/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Inquiries</h1>
        <span className="text-sm text-muted-foreground">{inquiries.length} total</span>
      </div>

      {loading ? <Spinner /> : inquiries.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-8 text-center text-muted-foreground shadow-sm">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium text-lg text-foreground">No inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map(q => (
            <div key={q.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                  <p className="font-semibold text-lg">{q.name}</p>
                  <p className="text-sm text-muted-foreground">{q.email}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</span>
                  <button onClick={() => remove(q.id)} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded-2xl p-4">{q.message}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ManageUsers() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => api<UserAdmin[]>('/admin/users').then(setUsers).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Users</h1>
        <span className="text-sm text-muted-foreground">{users.length} total</span>
      </div>

      {loading ? <Spinner /> : users.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-8 text-center text-muted-foreground shadow-sm">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium text-lg text-foreground">No users registered yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Auth</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Role</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Orders</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? 'bg-background/50' : ''}`}>
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.auth_method === 'google' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-muted text-muted-foreground'}`}>
                        {u.auth_method === 'google' ? 'Google' : 'Email'}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell capitalize">{u.role}</td>
                    <td className="p-4 hidden md:table-cell">{u.order_count}</td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface SalesContact {
  contact_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_primary: string;
  company_name: string;
  company_type: string;
  industry: string;
  lead_source: string;
  lead_status: string;
  lead_priority: string;
  ai_score: number;
  deal_value: number;
  assigned_to: string;
  next_followup_at: string;
  last_contacted_at: string;
  packaging_preference: string[];
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const leadStatusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  contacted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  qualified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  proposal_sent: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  negotiation: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  closed_won: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  closed_lost: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  dormant: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
};

function SalesContacts() {
  const [contacts, setContacts] = useState<SalesContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', priority: '', search: '' });

  const load = () => {
    setLoading(true);
    // Use static seed data for demo
    const staticContacts: SalesContact[] = [
      { contact_id: '1', first_name: 'Priya', last_name: 'Sharma', email: 'priya.sharma@kalisoftai.com', phone_primary: '+91-9876543210', company_name: 'KaliSoft AI', company_type: 'enterprise', industry: 'Technology', lead_source: 'website', lead_status: 'qualified', lead_priority: 'critical', ai_score: 92, deal_value: 500000, assigned_to: 'self', next_followup_at: '2026-09-10T10:00:00', last_contacted_at: '2026-09-05T14:30:00', packaging_preference: ['custom_box', 'vci'] },
      { contact_id: '2', first_name: 'Vikram', last_name: 'Singh', email: 'vikram.singh@tataindustries.com', phone_primary: '+91-9812345001', company_name: 'Tata Industries', company_type: 'manufacturer', industry: 'Manufacturing', lead_source: 'trade_show', lead_status: 'negotiation', lead_priority: 'critical', ai_score: 88, deal_value: 2500000, assigned_to: 'Priya', next_followup_at: '2026-09-08T15:00:00', last_contacted_at: '2026-09-04T11:00:00', packaging_preference: ['vci', 'custom_box', 'stretch_film'] },
      { contact_id: '3', first_name: 'Meera', last_name: 'Reddy', email: 'meera.reddy@reliance-retail.com', phone_primary: '+91-9812345002', company_name: 'Reliance Retail', company_type: 'retailer', industry: 'Retail', lead_source: 'referral', lead_status: 'proposal_sent', lead_priority: 'high', ai_score: 75, deal_value: 1800000, assigned_to: 'Priya', next_followup_at: '2026-09-12T09:00:00', last_contacted_at: '2026-09-03T16:45:00', packaging_preference: ['stretch_film', 'standard'] },
      { contact_id: '4', first_name: 'Arjun', last_name: 'Nair', email: 'arjun.nair@infosys.com', phone_primary: '+91-9812345003', company_name: 'Infosys Limited', company_type: 'enterprise', industry: 'IT Services', lead_source: 'linkedin', lead_status: 'qualified', lead_priority: 'high', ai_score: 82, deal_value: 3700000, assigned_to: 'Rahul', next_followup_at: '2026-09-09T11:30:00', last_contacted_at: '2026-09-02T10:15:00', packaging_preference: ['vci', 'custom_box'] },
      { contact_id: '5', first_name: 'Vikram', last_name: 'Singh', email: 'vikram.singh@tataindustries.com', phone_primary: '+91-9812345004', company_name: 'Mahindra Manufacturing', company_type: 'manufacturer', industry: 'Automotive', lead_source: 'indiamart', lead_status: 'contacted', lead_priority: 'medium', ai_score: 55, deal_value: 0, assigned_to: 'Anita', next_followup_at: '2026-09-14T14:00:00', last_contacted_at: '2026-09-01T09:30:00', packaging_preference: ['vci', 'stretch_film'] },
      { contact_id: '6', first_name: 'Aditya', last_name: 'Joshi', email: 'aditya.joshi@techstartup.io', phone_primary: '+91-9812345006', company_name: 'TechStartup India', company_type: 'startup', industry: 'Technology', lead_source: 'google_ads', lead_status: 'qualified', lead_priority: 'medium', ai_score: 62, deal_value: 1500000, assigned_to: 'Rahul', next_followup_at: '2026-09-11T10:00:00', last_contacted_at: '2026-08-30T15:00:00', packaging_preference: ['standard', 'stretch_film'] },
      { contact_id: '7', first_name: 'Rajesh', last_name: 'Kumar', email: 'rajesh.kumar@karnataka.gov.in', phone_primary: '+91-9812345008', company_name: 'Karnataka State IT Dept', company_type: 'government', industry: 'Government', lead_source: 'cold_call', lead_status: 'negotiation', lead_priority: 'critical', ai_score: 85, deal_value: 5000000, assigned_to: 'Priya', next_followup_at: '2026-09-07T16:00:00', last_contacted_at: '2026-09-05T11:30:00', packaging_preference: ['vci', 'custom_box', 'stretch_film'] },
      { contact_id: '8', first_name: 'James', last_name: 'Wilson', email: 'james.wilson@globaltech.ae', phone_primary: '+971-50-1234567', company_name: 'Global Tech Trading', company_type: 'distributor', industry: 'Technology', lead_source: 'trade_show', lead_status: 'qualified', lead_priority: 'high', ai_score: 78, deal_value: 2200000, assigned_to: 'Priya', next_followup_at: '2026-09-13T12:00:00', last_contacted_at: '2026-09-04T09:00:00', packaging_preference: ['vci', 'stretch_film', 'custom_box'] },
      { contact_id: '9', first_name: 'Neha', last_name: 'Kapoor', email: 'neha.kapoor@designstudio.co', phone_primary: '+91-9812345007', company_name: 'Design Studio Co', company_type: 'startup', industry: 'Creative', lead_source: 'whatsapp', lead_status: 'proposal_sent', lead_priority: 'high', ai_score: 70, deal_value: 850000, assigned_to: 'Rahul', next_followup_at: '2026-09-10T14:30:00', last_contacted_at: '2026-09-03T10:00:00', packaging_preference: ['custom_box', 'stretch_film'] },
      { contact_id: '10', first_name: 'Karthik', last_name: 'Menon', email: 'karthik.menon@oldclient.com', phone_primary: '+91-9812345009', company_name: 'Old Client Corp', company_type: 'distributor', industry: 'Distribution', lead_source: 'referral', lead_status: 'dormant', lead_priority: 'low', ai_score: 35, deal_value: 0, assigned_to: 'Anita', next_followup_at: '2026-09-20T10:00:00', last_contacted_at: '2026-05-15T11:00:00', packaging_preference: ['standard'] },
    ];
    setContacts(staticContacts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredContacts = contacts.filter(c => {
    if (filter.status && c.lead_status !== filter.status) return false;
    if (filter.priority && c.lead_priority !== filter.priority) return false;
    if (filter.search) {
      const search = filter.search.toLowerCase();
      return c.first_name.toLowerCase().includes(search) ||
             c.last_name.toLowerCase().includes(search) ||
             c.company_name.toLowerCase().includes(search) ||
             c.email.toLowerCase().includes(search);
    }
    return true;
  });

  const stats = {
    total: contacts.length,
    critical: contacts.filter(c => c.lead_priority === 'critical').length,
    negotiation: contacts.filter(c => c.lead_status === 'negotiation').length,
    totalDealValue: contacts.reduce((sum, c) => sum + (c.deal_value || 0), 0),
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Sales Contacts</h1>
          <p className="text-muted-foreground mt-1">Kalika Team - Lead Management</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Contact className="w-4 h-4" />
          <span>{stats.total} contacts</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: stats.total, icon: Users, color: 'bg-blue-500' },
          { label: 'Critical Priority', value: stats.critical, icon: AlertCircle, color: 'bg-red-500' },
          { label: 'In Negotiation', value: stats.negotiation, icon: TrendingUp, color: 'bg-amber-500' },
          { label: 'Pipeline Value', value: `Rs. ${(stats.totalDealValue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'bg-green-500' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-2xl ${card.color} flex items-center justify-center mb-3`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-3xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search contacts..."
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            className="flex-1 min-w-[200px] px-4 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={filter.status}
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            className="px-4 py-2 border border-border rounded-xl bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
            <option value="dormant">Dormant</option>
          </select>
          <select
            value={filter.priority}
            onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
            className="px-4 py-2 border border-border rounded-xl bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      {loading ? <Spinner /> : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium">Contact</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Company</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Status</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Priority</th>
                  <th className="text-center p-4 font-medium hidden lg:table-cell">AI Score</th>
                  <th className="text-right p-4 font-medium hidden lg:table-cell">Deal Value</th>
                  <th className="text-left p-4 font-medium hidden xl:table-cell">Follow-up</th>
                  <th className="text-left p-4 font-medium hidden xl:table-cell">Assigned</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact, i) => (
                  <tr key={contact.contact_id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? 'bg-background/50' : ''}`}>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">{contact.first_name} {contact.last_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {contact.email}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {contact.phone_primary}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div>
                        <p className="font-medium">{contact.company_name}</p>
                        <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                          <Building className="w-3 h-3" /> {contact.company_type}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${leadStatusColors[contact.lead_status] || 'bg-muted text-muted-foreground'}`}>
                        {contact.lead_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${priorityColors[contact.lead_priority] || 'bg-muted text-muted-foreground'}`}>
                        {contact.lead_priority}
                      </span>
                    </td>
                    <td className="p-4 text-center hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${contact.ai_score >= 80 ? 'bg-green-500' : contact.ai_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${contact.ai_score}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold">{contact.ai_score}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right hidden lg:table-cell">
                      {contact.deal_value > 0 ? (
                        <span className="font-semibold">Rs. {(contact.deal_value / 100000).toFixed(1)}L</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 hidden xl:table-cell">
                      {contact.next_followup_at ? (
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="w-3 h-3 text-primary" />
                          <span>{new Date(contact.next_followup_at).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4 hidden xl:table-cell">
                      <span className="text-xs text-muted-foreground">{contact.assigned_to}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SalesInsights() {
  const products = staticProducts;
  const categories = staticCategories;

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / totalProducts;
  const avgRating = products.reduce((sum, p) => sum + p.rating, 0) / totalProducts;
  const featuredCount = products.filter(p => p.isFeatured).length;
  const contactForPriceCount = products.filter(p => p.isContactForPrice).length;

  const categoryStats = categories.map(cat => {
    const catProducts = products.filter(p => p.categoryId === cat.id);
    const prices = catProducts.map(p => p.price).filter(p => p > 0);
    return {
      id: cat.id,
      name: cat.name,
      section: cat.section,
      count: catProducts.length,
      avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
      avgRating: catProducts.length > 0 ? catProducts.reduce((a, p) => a + p.rating, 0) / catProducts.length : 0,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      featured: catProducts.filter(p => p.isFeatured).length,
    };
  });

  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const priceRange = { min: Math.min(...products.map(p => p.price)), max: Math.max(...products.map(p => p.price)) };

  const packagingProducts = products.filter(p => categories.find(c => c.id === p.categoryId)?.section === 'packaging');
  const aiProducts = products.filter(p => categories.find(c => c.id === p.categoryId)?.section === 'ai-solutions');

  const uomDistribution = products.reduce((acc, p) => {
    const uom = p.uom || 'N/A';
    acc[uom] = (acc[uom] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moqProducts = products.filter(p => p.moq);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Sales Insights</h1>
          <p className="text-muted-foreground mt-1">Kalika Team Product Analytics Dashboard</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="w-4 h-4" />
          <span>{totalProducts} products analyzed</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: totalProducts, icon: Package, color: 'bg-blue-500', sub: `${featuredCount} featured` },
          { label: 'Categories', value: totalCategories, icon: Tags, color: 'bg-green-500', sub: 'product lines' },
          { label: 'Avg Price', value: `Rs. ${avgPrice.toFixed(2)}`, icon: DollarSign, color: 'bg-purple-500', sub: `Range: Rs. ${priceRange.min.toFixed(0)}-${priceRange.max.toFixed(0)}` },
          { label: 'Avg Rating', value: avgRating.toFixed(1), icon: Star, color: 'bg-amber-500', sub: 'across all products' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-2xl ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Business Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Business Split</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Industrial Packaging</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{packagingProducts.length} products</span>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(packagingProducts.length / totalProducts) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  <span className="text-sm font-medium">AI Solutions</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{aiProducts.length} products</span>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(aiProducts.length / totalProducts) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Contact-for-Price products</span>
                <span className="font-semibold">{contactForPriceCount} ({((contactForPriceCount / totalProducts) * 100).toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Unit of Measure</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(uomDistribution).sort(([,a], [,b]) => b - a).map(([uom, count]) => (
                <div key={uom} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{uom}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">{count}</span>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(count / totalProducts) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Category Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-center pb-3 font-medium text-muted-foreground">Products</th>
                  <th className="text-center pb-3 font-medium text-muted-foreground hidden sm:table-cell">Avg Price</th>
                  <th className="text-center pb-3 font-medium text-muted-foreground hidden md:table-cell">Avg Rating</th>
                  <th className="text-center pb-3 font-medium text-muted-foreground hidden lg:table-cell">Price Range</th>
                  <th className="text-center pb-3 font-medium text-muted-foreground hidden lg:table-cell">Featured</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.sort((a, b) => b.count - a.count).map((cat, i) => (
                  <tr key={cat.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-background/50' : ''}`}>
                    <td className="py-3 px-2">
                      <div>
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-xs text-muted-foreground ml-2 capitalize">({cat.section || 'main'})</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-semibold">{cat.count}</td>
                    <td className="py-3 px-2 text-center hidden sm:table-cell">{cat.avgPrice > 0 ? `Rs. ${cat.avgPrice.toFixed(2)}` : 'Contact'}</td>
                    <td className="py-3 px-2 text-center hidden md:table-cell">
                      <span className="text-amber-500">★</span> {cat.avgRating.toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-center text-muted-foreground text-xs hidden lg:table-cell">
                      {cat.minPrice > 0 ? `Rs. ${cat.minPrice.toFixed(0)} - ${cat.maxPrice.toFixed(0)}` : 'Contact'}
                    </td>
                    <td className="py-3 px-2 text-center hidden lg:table-cell">
                      {cat.featured > 0 && (
                        <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">{cat.featured}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Top Rated Products */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-lg">Top Rated Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topRated.map((product, i) => (
              <div key={product.id} className="relative bg-muted/30 rounded-2xl p-4 border border-border hover:border-primary/50 transition-colors">
                <div className="absolute -top-2 -left-2 w-7 h-7 bg-primary text-black rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                  #{i + 1}
                </div>
                <h3 className="font-semibold text-sm mt-1 line-clamp-2 mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{categories.find(c => c.id === product.categoryId)?.name.split(' ')[0]}</span>
                  <span className="text-xs font-bold text-amber-500">★ {product.rating}</span>
                </div>
                {product.price > 0 && (
                  <p className="text-sm font-bold mt-2">Rs. {product.price.toFixed(2)}</p>
                )}
                {product.isContactForPrice && (
                  <p className="text-xs text-primary font-medium mt-2">Contact for Price</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Featured & MOQ Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Featured Products</h2>
            </div>
            <div className="space-y-3">
              {products.filter(p => p.isFeatured).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{categories.find(c => c.id === p.categoryId)?.name}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <span className="text-xs text-amber-500">★ {p.rating}</span>
                    <span className="text-xs font-bold">{p.price > 0 ? `Rs. ${p.price.toFixed(2)}` : 'Contact'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">MOQ Insights</h2>
              <span className="text-xs text-muted-foreground ml-auto">{moqProducts.length} products with MOQ</span>
            </div>
            <div className="space-y-3">
              {moqProducts.sort((a, b) => (a.moq || 0) - (b.moq || 0)).slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{categories.find(c => c.id === p.categoryId)?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                      MOQ: {p.moq} {p.uom}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Price Tier Analysis */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Price Tier Analysis</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Budget', range: 'Under Rs. 25', count: products.filter(p => p.price > 0 && p.price < 25).length, color: 'bg-emerald-500' },
              { label: 'Standard', range: 'Rs. 25-50', count: products.filter(p => p.price >= 25 && p.price <= 50).length, color: 'bg-blue-500' },
              { label: 'Premium', range: 'Rs. 50-100', count: products.filter(p => p.price > 50 && p.price <= 100).length, color: 'bg-violet-500' },
              { label: 'Enterprise', range: 'Over Rs. 100', count: products.filter(p => p.price > 100).length, color: 'bg-amber-500' },
            ].map(tier => (
              <div key={tier.label} className="text-center p-4 bg-muted/30 rounded-2xl">
                <div className={`w-12 h-12 mx-auto rounded-2xl ${tier.color} flex items-center justify-center mb-3`}>
                  <span className="text-white font-bold text-lg">{tier.count}</span>
                </div>
                <p className="font-semibold text-sm">{tier.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{tier.range}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
