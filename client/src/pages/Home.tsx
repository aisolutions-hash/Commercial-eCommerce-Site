import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Carousel from '../components/Carousel';
import ProductCard from '../components/ProductCard';
import { categories, products } from '../data';
import { ArrowRight, Megaphone } from 'lucide-react';
import ImageWithFallback from '../components/ImageWithFallback';

export default function Home() {
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col pt-4">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Banner/Carousel */}
        <Carousel />

        {/* Categories Section */}
        <section className="py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold tracking-tight">Shop by Category</h2>
            <Link to="/categories" className="text-primary hover:text-primary-dark font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, idx) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link to={`/categories?id=${category.id}`} className="group block relative h-64 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors z-10" />
                  <ImageWithFallback 
                    src={category.image} 
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    containerClassName="absolute inset-0 w-full h-full"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 z-20">
                    <h3 className="text-white font-bold text-xl mb-1">{category.name}</h3>
                    <p className="text-gray-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                      {category.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold tracking-tight">Featured Products</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, idx) => (
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
                    to="#"
                    className="flex items-center justify-center px-4 py-2 text-sm font-bold rounded-full transition-colors bg-foreground text-background hover:bg-primary hover:text-black"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Value Proposition / 'Cute' Banner */}
        <section className="my-16 bg-muted rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
           <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
           
           <div className="max-w-xl relative z-10 text-center md:text-left mb-8 md:mb-0">
             <h2 className="text-4xl font-serif font-bold mb-4">Quality packaging, delivered with care. ✨</h2>
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
