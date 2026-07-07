import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Carousel from '../components/Carousel';
import TrustedBy from '../components/TrustedBy';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Megaphone } from 'lucide-react';
import ImageWithFallback from '../components/ImageWithFallback';
import { getCategories, getProducts, Category, ProductRead } from '../lib/api';
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

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getProducts({ per_page: 50 })]).then(([cats, prods]) => {
      setCategories(cats);
      const typed = prods.items.map(toProductType);
      setAllProducts(typed);
      setFeatured(typed.filter((p) => p.is_featured).slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  const productsByCategory: Record<string, Product[]> = {};
  for (const p of allProducts) {
    const cid = p.categoryId || '__none__';
    if (!productsByCategory[cid]) productsByCategory[cid] = [];
    productsByCategory[cid].push(p);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col pt-4">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-4">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Carousel />
        <TrustedBy />

        <section className="py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold tracking-tight">Shop by Category</h2>
          </div>

          {categories.filter(c => (productsByCategory[c.id]?.length || 0) > 0).map((cat, ci) => {
            const products = (productsByCategory[cat.id] || []).slice(0, 3);
            return (
              <div key={cat.id} className="py-10 even:bg-muted/30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-serif font-bold">{cat.name}</h3>
                    <p className="text-muted-foreground text-sm mt-0.5">{cat.description}</p>
                  </div>
                  <Link
                    to={`/categories?id=${cat.id}`}
                    className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
                <div className="mt-5 text-center sm:hidden">
                  <Link
                    to={`/categories?id=${cat.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary border border-primary/30 px-5 py-2.5 rounded-full hover:bg-primary hover:text-black transition-colors"
                  >
                    View All {cat.name} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </section>

        <section className="py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold tracking-tight">Featured Products</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group bg-card text-card-foreground rounded-[var(--radius-2xl)] overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-primary/10 flex flex-col items-center justify-center">
                <Link to="#" className="block w-full h-full flex flex-col items-center justify-center p-6 text-center">
                   <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110">
                     <Megaphone className="w-8 h-8 text-black" />
                   </div>
                   <h3 className="font-bold text-2xl text-foreground transition-transform duration-500 group-hover:scale-105">Advertise<br/>With Us</h3>
                </Link>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <Link to="#">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 hover:text-primary transition-colors">Promoted Placement</h3>
                  </Link>
                </div>
                
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-sm font-medium text-muted-foreground line-clamp-2">Reach thousands of industrial buyers across our entire network seamlessly.</span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="font-bold text-xl">Partnership</div>
                  </div>
                  <Link 
                    to="/contact"
                    className="flex items-center justify-center px-4 py-2 text-sm font-bold rounded-full transition-colors bg-foreground text-background hover:bg-primary hover:text-black"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="my-16 bg-muted rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
           <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
           
           <div className="max-w-xl relative z-10 text-center md:text-left mb-8 md:mb-0">
             <h2 className="text-4xl font-serif font-bold mb-4">Quality packaging, delivered with care.</h2>
             <p className="text-lg text-muted-foreground mb-6">
               Whether you're wrapping pallets or packing lunch, our curated selection of goods has the strength and sustainability you need.
             </p>
             <Link to="/categories" className="bg-foreground text-background hover:bg-primary hover:text-black px-8 py-3 rounded-full font-bold transition-all shadow-md inline-block">
                Start Shopping
             </Link>
           </div>
           
           <div className="relative z-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full border-8 border-background overflow-hidden shadow-xl bg-muted">
             <ImageWithFallback src="/kalisoft-logo.png" alt="Kalisoft AI Logo" className="w-full h-full object-cover transform scale-[1.3]" containerClassName="w-full h-full" />
           </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
