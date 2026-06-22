import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useStore } from '../store';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { getProducts, ProductRead } from '../lib/api';
import { Product } from '../types';

function toProductType(p: ProductRead): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    longDescription: p.long_description || undefined,
    price: p.price,
    categoryId: p.category_id,
    images: p.images,
    rating: p.rating,
    reviews: [],
    features: p.features || undefined,
    isFeatured: p.is_featured,
    isContactForPrice: p.is_contact_for_price,
    moq: p.moq || undefined,
    uom: p.uom || undefined,
  };
}

export default function Wishlist() {
  const { wishlist } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length === 0) {
      setLoading(false);
      return;
    }
    getProducts({ per_page: 100 }).then((data) => {
      const wished = data.items
        .filter((p) => wishlist.includes(p.id))
        .map(toProductType);
      setProducts(wished);
    }).finally(() => setLoading(false));
  }, [wishlist]);

  return (
    <div className="min-h-screen flex flex-col pt-4">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 md:py-16">
        <h1 className="text-4xl font-serif font-bold tracking-tight mb-8">Your Wishlist</h1>
        
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
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
