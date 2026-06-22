import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { login as apiLogin, register as apiRegister, getProfile } from '../lib/api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useStore(state => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = isLogin
        ? await apiLogin(email, password)
        : await apiRegister(name, email, password);

      setAuth(res.access_token, { name: '', email });

      const profile = await getProfile();
      setAuth(res.access_token, { name: profile.name, email: profile.email });

      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect') || '/';
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-4">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card p-8 rounded-3xl shadow-sm border border-border"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground">
              {isLogin ? 'Enter your details to access your account.' : 'Join us to checkout and save your preferences.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground placeholder-muted-foreground"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground placeholder-muted-foreground"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground placeholder-muted-foreground"
                placeholder="Min. 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background hover:bg-primary hover:text-black py-3 rounded-full font-bold transition-colors mt-6 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary-dark font-medium underline-offset-4 hover:underline text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
