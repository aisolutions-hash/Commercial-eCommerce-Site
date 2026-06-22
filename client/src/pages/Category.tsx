import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { Filter, X } from 'lucide-react';
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

export default function CategoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('id') || 'all';
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) setSelectedCategory(id);
  }, [searchParams]);

  useEffect(() => {
    Promise.all([getCategories(), getProducts({ per_page: 100 })]).then(([cats, prods]) => {
      setCategories(cats);
      setAllProducts(prods.items.map(toProductType));
    }).finally(() => setLoading(false));
  }, []);

  const searchQuery = searchParams.get('q') || '';

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        const categoryMatch = categories.find(c => c.id === p.categoryId)?.name.toLowerCase().includes(lowerQ);
        if (!p.name.toLowerCase().includes(lowerQ) && !p.description.toLowerCase().includes(lowerQ) && !categoryMatch) {
          return false;
        }
      }
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
      if (p.rating < minRating) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
  }, [allProducts, selectedCategory, minRating, maxPrice, searchQuery, categories]);

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
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-4xl font-serif font-bold tracking-tight">
              {searchQuery 
                ? `Search Results for "${searchQuery}"`
                : selectedCategory === 'all' 
                  ? 'All Products' 
                  : categories.find(c => c.id === selectedCategory)?.name || 'Products'}
            </h1>
            {searchQuery && (
              <button 
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('q');
                  setSearchParams(newParams);
                }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full transition-colors"
              >
                Clear Search <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button 
            className="md:hidden mt-4 flex items-center gap-2 text-sm font-medium border border-border px-4 py-2 rounded-full"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          <aside className={`w-full md:w-64 shrink-0 bg-card md:bg-transparent p-6 md:p-0 rounded-[2rem] md:rounded-none z-40 fixed md:relative inset-x-0 bottom-0 md:inset-auto max-h-[80vh] overflow-y-auto ${showFilters ? 'block shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none' : 'hidden md:block'}`}>
             <div className="md:hidden flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 bg-muted rounded-full"><X className="w-5 h-5"/></button>
             </div>
             
             <div className="space-y-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Categories</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className={`block w-full text-left text-sm py-1 transition-colors ${selectedCategory === 'all' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      All Categories
                    </button>
                    
                    <div className="pt-4 pb-2 text-xs font-bold text-foreground uppercase tracking-wider">Packaging</div>
                    {categories.filter(c => c.section === 'packaging').map(c => (
                      <button 
                        key={c.id}
                        onClick={() => setSelectedCategory(c.id)}
                        className={`block w-full text-left text-sm py-1 transition-colors ${selectedCategory === c.id ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {c.name}
                      </button>
                    ))}

                    <div className="pt-4 pb-2 text-xs font-bold text-foreground uppercase tracking-wider">AI Solutions</div>
                    {categories.filter(c => c.section === 'ai-solutions').map(c => (
                      <button 
                        key={c.id}
                        onClick={() => setSelectedCategory(c.id)}
                        className={`block w-full text-left text-sm py-1 transition-colors ${selectedCategory === c.id ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Max Price: Rs. {maxPrice}</h3>
                  <input 
                    type="range" 
                    min="1" 
                    max="50000" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Rs. 1</span>
                    <span>Rs. 50,000+</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Minimum Rating: {minRating} ★</h3>
                   <input 
                    type="range" 
                    min="0" 
                    max="5" 
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
             </div>
          </aside>

          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">—</div>
                <h3 className="text-xl font-medium text-muted-foreground">No products found matching your criteria.</h3>
                <button 
                  onClick={() => { 
                    setSelectedCategory('all'); 
                    setMinRating(0); 
                    setMaxPrice(50000); 
                    setSearchParams({}); 
                  }}
                  className="mt-4 px-6 py-2 bg-primary text-black rounded-full font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
