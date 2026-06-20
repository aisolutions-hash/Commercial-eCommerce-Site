import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Search, Menu, X, Moon, Sun, User as UserIcon, LogOut } from 'lucide-react';
import { useStore } from '../store';

export default function Navbar() {
  const { cart, theme, toggleTheme, user, logout } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const cartCount = cart.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/categories?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xl">K</div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">
                KaliSoft <span className="text-primary-dark">AI</span>
                <span className="text-sm font-normal text-muted-foreground ml-2 tracking-widest hidden lg:inline-block">eMarketplace</span>
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-border rounded-full leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                placeholder="Search products, categories..."
              />
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/categories" className="text-sm font-medium hover:text-primary transition-colors">Categories</Link>
            
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            
            <Link to="/wishlist" className="p-2 rounded-full hover:bg-muted transition-colors relative">
              <Heart className="h-5 w-5" />
            </Link>

            <Link to="/checkout" className="p-2 rounded-full hover:bg-muted transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-black transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary-dark font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-2">
                    <div className="px-4 py-2 border-b border-border mb-2">
                      <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link 
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted font-medium transition-colors"
                    >
                      View Profile
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="text-sm font-bold bg-foreground text-background hover:bg-primary hover:text-black px-4 py-2 rounded-full transition-colors">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <Link to="/checkout" className="relative p-2">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-black transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-muted focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="p-2">
               <form onSubmit={handleSearch} className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                    placeholder="Search..."
                  />
                </form>
            </div>
            <Link to="/categories" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted" onClick={() => setIsOpen(false)}>Categories</Link>
            <Link to="/wishlist" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-muted" onClick={() => setIsOpen(false)}>Wishlist</Link>
            
            {user ? (
              <div className="pt-4 mt-2 border-t border-border">
                <div className="px-3 py-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-dark font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Link 
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 mt-2 rounded-md text-base font-medium hover:bg-muted"
                >
                  View Profile
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 mt-2 rounded-md text-base font-medium text-red-500 hover:bg-muted flex items-center gap-2"
                >
                  <LogOut className="h-5 w-5" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="p-3">
                <Link 
                  to="/auth" 
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center text-base font-bold bg-foreground text-background hover:bg-primary hover:text-black px-4 py-3 rounded-xl transition-colors"
                >
                  Sign In / Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
