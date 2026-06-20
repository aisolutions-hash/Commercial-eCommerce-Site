import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useStore } from '../store';
import { Trash2, Heart, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { products } from '../data';

export default function Wishlist() {
  const { wishlist, cart, removeFromCart } = useStore();
  
  const wishlistedProducts = wishlist.map(id => products.find(p => p.id === id)).filter(Boolean) as typeof products;

  return (
    <div className="min-h-screen flex flex-col pt-4">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 md:py-16">
        <h1 className="text-4xl font-serif font-bold tracking-tight mb-8">Your Wishlist</h1>
        
        {wishlistedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistedProducts.map(product => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-muted rounded-[3rem]">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8">Save items you love to build your perfect collection.</p>
            <Link to="/categories" className="bg-primary text-black font-bold px-8 py-3 rounded-full hover:bg-primary-dark transition-colors">
              Explore Products
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
