import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Package, MapPin, CreditCard, LogOut, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getOrders, getProfile, OrderRead, UserRead } from '../lib/api';

export default function Profile() {
  const { user, logout, token } = useStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRead[]>([]);
  const [profile, setProfile] = useState<UserRead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    Promise.all([
      getProfile().then(setProfile),
      getOrders().then(setOrders),
    ]).catch(() => {
      logout();
      navigate('/auth?redirect=/profile');
    }).finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col pt-4">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
            <button 
              onClick={() => navigate('/auth?redirect=/profile')}
              className="bg-primary text-black font-bold px-6 py-2 rounded-full hover:bg-primary-dark transition-colors"
            >
              Sign In
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';

  return (
    <div className="min-h-screen flex flex-col pt-4">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex flex-col items-center justify-center text-primary-dark font-bold text-2xl">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-lg">{displayName}</h2>
                  <p className="text-sm text-muted-foreground">{displayEmail}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button className="w-full text-left flex items-center gap-3 px-4 py-3 bg-muted rounded-xl text-foreground font-medium transition-colors">
                  <Package className="w-5 h-5" /> Orders
                </button>
                <Link to="/wishlist" className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground font-medium transition-colors">
                  <Heart className="w-5 h-5" /> Wishlist
                </Link>
                <button className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground font-medium transition-colors">
                  <MapPin className="w-5 h-5" /> Addresses
                </button>
                <button className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground font-medium transition-colors">
                  <CreditCard className="w-5 h-5" /> Payment Methods
                </button>
                <button 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 mt-4 text-red-500 hover:bg-red-500/10 rounded-xl font-medium transition-colors border-t border-border"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </nav>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <h1 className="text-3xl font-serif font-bold tracking-tight mb-8">
              {loading ? 'Loading...' : `Recent Orders (${orders.length})`}
            </h1>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="font-bold text-lg">Order #{order.id.slice(0, 8)}</span>
                        <span className="text-sm text-muted-foreground ml-4">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-sm font-semibold capitalize bg-primary/20 text-black dark:text-primary px-3 py-1 rounded-full">
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.items.length} item(s) — Rs. {Number(order.total).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-3xl p-8 text-center text-muted-foreground shadow-sm">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium text-lg text-foreground">No recent orders found.</p>
                <p className="text-sm mt-1 mb-6">Looks like you haven't made your first purchase yet.</p>
                <Link to="/categories" className="bg-foreground text-background px-6 py-2 rounded-full font-bold hover:bg-primary hover:text-black transition-colors inline-block">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
