import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useStore } from '../store';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import ImageWithFallback from '../components/ImageWithFallback';
import { getProduct, ProductDetail } from '../lib/api';
import { Product } from '../types';

function toProduct(p: ProductDetail): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    longDescription: p.long_description || undefined,
    price: p.price,
    categoryId: p.category_id,
    images: p.images,
    rating: p.rating,
    reviews: p.reviews.map((r) => ({
      id: r.id,
      userName: r.user_name,
      rating: r.rating,
      comment: r.comment || '',
      date: r.date,
    })),
    features: p.features || undefined,
    isFeatured: p.is_featured,
    isContactForPrice: p.is_contact_for_price,
    moq: p.moq || undefined,
    uom: p.uom || undefined,
  };
}

const parseInlineFormatting = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="italic text-foreground">{part.slice(1, -1)}</em>;
    return part;
  });
};

const renderRichDescription = (text: string) => {
  const blocks = text.split('\n\n');
  return (
    <div className="space-y-6 mb-8">
      {blocks.map((block, i) => {
        if (block.startsWith('* ') || block.startsWith('- ') || block.includes('\n* ') || block.includes('\n  *')) {
          const lines = block.split('\n').filter(l => l.trim().length > 0);
          return (
            <ul key={i} className="space-y-3">
              {lines.map((line, j) => {
                const isSubList = line.startsWith('  ') || line.startsWith('\t');
                const cleanLine = line.replace(/^[\s*\-]+/, '');
                return (
                  <li key={j} className={cn("flex gap-3", isSubList ? "ml-8" : "")}>
                    <div className={cn("mt-2 rounded-full shrink-0", isSubList ? "w-1 h-1 bg-muted-foreground" : "w-1.5 h-1.5 bg-primary")} />
                    <span className="text-muted-foreground">{parseInlineFormatting(cleanLine)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }
        
        if (block.startsWith('**') && block.endsWith('**') && !block.includes('\n')) {
          return <h3 key={i} className="text-xl font-bold font-serif text-foreground mt-8 mb-4 border-b border-border pb-2">{block.replace(/\*\*/g, '')}</h3>;
        }
        
        return <p key={i} className="text-lg text-muted-foreground leading-relaxed">{parseInlineFormatting(block)}</p>;
      })}
    </div>
  );
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    getProduct(id).then((data) => {
      const p = toProduct(data);
      setProduct(p);
      setQuantity(p.moq || 1);
      setActiveImage(0);
    }).catch((err) => {
      setError(err.message || 'Product not found');
    }).finally(() => setLoading(false));
  }, [id]);

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

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col pt-4">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Link to="/categories" className="text-primary hover:underline">Return to Shop</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="min-h-screen flex flex-col pt-4">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 md:py-16">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          <div className="space-y-4">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-muted">
               <ImageWithFallback 
                 src={product.images[activeImage]} 
                 alt={product.name}
                 className="w-full h-full object-cover"
                 containerClassName="absolute inset-0 w-full h-full"
               />
               <button 
                 onClick={() => toggleWishlist(product.id)}
                 className="absolute top-6 right-6 p-4 rounded-full bg-background/80 backdrop-blur-md shadow-sm hover:scale-110 transition-transform"
               >
                 <Heart className={cn("w-6 h-6", isWishlisted && "fill-primary text-primary")} />
               </button>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)}
                    className={cn("w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all", activeImage === idx ? 'border-primary' : 'border-transparent opacity-70')}
                  >
                    <ImageWithFallback src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" containerClassName="w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{product.categoryId.replace('-', ' ')}</span>
                <span className="flex items-center gap-1 text-sm bg-primary/20 text-black px-2 py-0.5 rounded-full font-bold dark:text-primary">
                  <Star className="w-3 h-3 fill-current" /> {product.rating.toFixed(1)}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-balance leading-tight mb-4">{product.name}</h1>
              {product.isContactForPrice ? (
                <p className="text-4xl font-light mb-6">Contact for Price</p>
              ) : (
                <p className="text-4xl font-light mb-6">Rs. {product.price.toFixed(2)}</p>
              )}
              
              {product.moq && !product.isContactForPrice && (
                <div className="bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/20 text-sm font-semibold rounded-lg px-3 py-2 mb-6 inline-flex gap-2 items-center">
                   Minimum Order Quantity (MOQ): {product.moq} {product.uom || 'units'}
                </div>
              )}

              {product.longDescription ? (
                renderRichDescription(product.longDescription)
              ) : (
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">{product.description}</p>
              )}
            </div>

            {product.features && !product.longDescription && (
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.isContactForPrice ? (
              <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm mb-8">
                <p className="text-muted-foreground mb-6">
                  This product requires a customized quote based on your specific requirements and integration needs.
                </p>
                <Link
                  to="/contact"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-lg bg-foreground text-background hover:bg-primary hover:text-black transition-colors"
                >
                  Contact Us for Details
                </Link>
              </div>
            ) : (
              <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm mb-8">
                <div className="flex items-center gap-6 mb-6">
                  <div className="font-semibold">Quantity</div>
                  <div className="flex items-center bg-muted rounded-full">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors">-</button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors">+</button>
                  </div>
                </div>

                {product.moq && quantity < product.moq && (
                  <div className="bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/20 text-sm font-semibold rounded-lg p-3 mb-4 flex text-center items-center justify-center">
                    Minimum Order Quantity is {product.moq} {product.uom || ''}. Please increase quantity to proceed.
                  </div>
                )}

                <motion.button
                  whileTap={quantity >= (product.moq || 1) ? { scale: 0.98 } : {}}
                  onClick={() => quantity >= (product.moq || 1) && addToCart(product, quantity)}
                  disabled={quantity < (product.moq || 1)}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-lg transition-colors",
                    quantity >= (product.moq || 1)
                      ? "bg-foreground text-background hover:bg-primary hover:text-black"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart — Rs. {(product.price * quantity).toFixed(2)}
                </motion.button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-auto pt-8 border-t border-border">
               <div className="flex items-center gap-3 text-sm text-muted-foreground">
                 <ShieldCheck className="w-8 h-8 text-primary" />
                 <span>Secure Checkout</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-muted-foreground">
                 <Truck className="w-8 h-8 text-primary" />
                 <span>Fast Delivery</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-muted-foreground col-span-2">
                 <RotateCcw className="w-8 h-8 text-primary" />
                 <span>30-Day Easy Returns on eligible items</span>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-24">
          <h2 className="text-3xl font-serif font-bold mb-8">Customer Reviews</h2>
          {product.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.reviews.map(review => (
                <div key={review.id} className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-bold">{review.userName}</div>
                    <div className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("w-4 h-4", i < review.rating ? "fill-primary text-primary" : "text-muted")} />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
             <div className="bg-muted rounded-[2rem] p-12 text-center">
               <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
             </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
