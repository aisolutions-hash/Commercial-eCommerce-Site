import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Package, Tags, ShoppingCart, MessageSquare, ArrowRight, Trash2 } from 'lucide-react';
import { getProducts, getCategories, Category, ProductRead } from '../lib/api';

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

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const token = () => localStorage.getItem('kalisoft-storage') ? JSON.parse(localStorage.getItem('kalisoft-storage')!).token : null;

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
  return <Overview />;
}

function Overview() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, inquiries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ per_page: 1 }).then(r => setStats(s => ({ ...s, products: r.total }))).catch(() => {}),
      getCategories().then(r => setStats(s => ({ ...s, categories: r.length }))).catch(() => {}),
      api<OrderItem[]>('/admin/orders').then(r => setStats(s => ({ ...s, orders: r.length }))).catch(() => {}),
      api<Inquiry[]>('/admin/inquiries').then(r => setStats(s => ({ ...s, inquiries: r.length }))).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Products', value: stats.products, icon: Package, href: '/admin/products', color: 'bg-blue-500' },
    { label: 'Categories', value: stats.categories, icon: Tags, href: '/admin/categories', color: 'bg-green-500' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, href: '/admin/orders', color: 'bg-purple-500' },
    { label: 'Inquiries', value: stats.inquiries, icon: MessageSquare, href: '/admin/inquiries', color: 'bg-orange-500' },
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

  useEffect(load, []);

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
  useEffect(load, []);

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
  useEffect(load, []);

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
  useEffect(load, []);

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
