import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary text-black' : 'text-muted-foreground hover:bg-muted'}`}>
      {children}
    </button>
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
  useEffect(() => {
    Promise.all([
      getProducts({ per_page: 1 }).then(r => setStats(s => ({ ...s, products: r.total }))).catch(() => {}),
      getCategories().then(r => setStats(s => ({ ...s, categories: r.length }))).catch(() => {}),
      api<OrderItem[]>('/admin/orders').then(r => setStats(s => ({ ...s, orders: r.length }))).catch(() => {}),
      api<Inquiry[]>('/admin/inquiries').then(r => setStats(s => ({ ...s, inquiries: r.length }))).catch(() => {}),
    ]);
  }, []);

  const cards = [
    { label: 'Products', value: stats.products, color: 'bg-blue-500' },
    { label: 'Categories', value: stats.categories, color: 'bg-green-500' },
    { label: 'Orders', value: stats.orders, color: 'bg-purple-500' },
    { label: 'Inquiries', value: stats.inquiries, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-4 gap-6">
        {cards.map(c => (
          <div key={c.label} className="bg-card rounded-2xl border border-border p-6">
            <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center mb-4`}>
              <span className="text-white font-bold text-lg">{c.label[0]}</span>
            </div>
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-muted-foreground text-sm mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Price</th>
              <th className="text-left p-4 font-medium">Category</th>
              <th className="text-left p-4 font-medium">Rating</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-4">{p.name}</td>
                <td className="p-4">Rs. {p.price.toFixed(2)}</td>
                <td className="p-4 text-muted-foreground">{p.category_id}</td>
                <td className="p-4">{p.rating.toFixed(1)} ★</td>
                <td className="p-4 text-right">
                  <button onClick={() => remove(p.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Categories</h1>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Section</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="p-4">{c.name}</td>
                <td className="p-4 text-muted-foreground">{c.section}</td>
                <td className="p-4 text-right">
                  <button onClick={() => remove(c.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium">ID</th>
              <th className="text-left p-4 font-medium">Total</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Date</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-border last:border-0">
                <td className="p-4 font-mono text-xs">{o.id.slice(0, 8)}...</td>
                <td className="p-4">Rs. {o.total.toFixed(2)}</td>
                <td className="p-4 capitalize">{o.status}</td>
                <td className="p-4 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <select
                    value={o.status}
                    onChange={e => updateStatus(o.id, e.target.value)}
                    className="text-sm border border-border rounded-lg px-2 py-1 bg-background"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Inquiries</h1>
      <div className="space-y-4">
        {inquiries.map(q => (
          <div key={q.id} className="bg-card rounded-2xl border border-border p-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">{q.name}</p>
                <p className="text-sm text-muted-foreground">{q.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</span>
                <button onClick={() => remove(q.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{q.message}</p>
          </div>
        ))}
        {inquiries.length === 0 && <p className="text-muted-foreground">No inquiries yet.</p>}
      </div>
    </div>
  );
}
