import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, FormEvent } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useStore } from '../store';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, ArrowLeft, Send, ThumbsUp, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import ImageWithFallback from '../components/ImageWithFallback';
import ProductCard from '../components/ProductCard';
import { getProduct, getProducts, ProductDetail, ProductRead, submitReview } from '../lib/api';
import { Product, Review } from '../types';

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
  const { addToCart, toggleWishlist, wishlist, user } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviewName, setReviewName] = useState(user?.name || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [helpful, setHelpful] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    setReviewSuccess(false);
    setReviewError('');
    Promise.all([
      getProduct(id),
      getProducts({ per_page: 50 }),
    ]).then(([data, all]) => {
      const p = toProduct(data);
      setProduct(p);
      setQuantity(p.moq || 1);
      setActiveImage(0);
      const relatedItems = all.items
        .filter((x) => x.category_id === p.categoryId && x.id !== p.id)
        .slice(0, 4)
        .map(toProductType);
      setRelated(relatedItems);
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

  const ratingCounts = product.reviews.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  const totalReviews = product.reviews.length;
  const avgRating = totalReviews > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  const handleSubmitReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product || !user || reviewRating < 1 || reviewRating > 5) return;
    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess(false);
    try {
      const newReview = await submitReview(product.id, {
        user_name: user.name,
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });
      const mapped: Review = {
        id: newReview.id,
        userName: newReview.user_name,
        rating: newReview.rating,
        comment: newReview.comment || '',
        date: newReview.date,
      };
      setProduct({
        ...product,
        reviews: [mapped, ...product.reviews],
        rating: product.reviews.length === 0
          ? newReview.rating
          : Number((
              (product.reviews.reduce((sum, r) => sum + r.rating, 0) + newReview.rating) /
              (product.reviews.length + 1)
            ).toFixed(1)),
      });
      setReviewComment('');
      setReviewSuccess(true);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm h-fit">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2">{avgRating.toFixed(1)}</div>
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-5 h-5", i < Math.round(avgRating) ? "fill-primary text-primary" : "text-muted")} />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Based on {totalReviews} human review{totalReviews !== 1 ? 's' : ''}</div>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingCounts[star] || 0;
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="w-3 font-medium">{star}</span>
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Write a human review</h3>
                {!user ? (
                  <p className="text-muted-foreground text-sm">
                    <Link to="/auth" className="text-primary hover:underline font-medium">Login</Link> to write a review.
                  </p>
                ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-sm text-muted-foreground w-fit">
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rating</label>
                    <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 w-fit">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewRating(n)}
                          className="focus:outline-none"
                          aria-label={`Rate ${n} stars`}
                        >
                          <Star className={cn("w-6 h-6 transition-colors", n <= reviewRating ? "fill-primary text-primary" : "text-muted")} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Review</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your honest experience with this product..."
                      className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none min-h-[100px] resize-none"
                    />
                  </div>
                  {reviewError && <p className="text-sm text-red-500">{reviewError}</p>}
                  {reviewSuccess && <p className="text-sm text-green-600">Thank you! Your review has been posted.</p>}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    disabled={reviewSubmitting}
                    type="submit"
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-colors",
                      reviewSubmitting
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-foreground text-background hover:bg-primary hover:text-black"
                    )}
                  >
                    <Send className="w-4 h-4" />
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </motion.button>
                </form>
                )}
              </div>

              {product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold">{review.userName}</div>
                            <div className="text-xs text-muted-foreground">Verified human reviewer</div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</div>
                      </div>
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("w-4 h-4", i < review.rating ? "fill-primary text-primary" : "text-muted")} />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4">{review.comment}</p>
                      <button
                        onClick={() => setHelpful((h) => ({ ...h, [review.id]: !h[review.id] }))}
                        className={cn(
                          "flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border transition-colors",
                          helpful[review.id]
                            ? "bg-primary text-black border-primary"
                            : "border-border text-muted-foreground hover:border-primary"
                        )}
                      >
                        <ThumbsUp className={cn("w-4 h-4", helpful[review.id] && "fill-black")} />
                        Helpful {helpful[review.id] ? '(1)' : ''}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted rounded-[2rem] p-12 text-center">
                  <p className="text-muted-foreground">No reviews yet. Be the first to share your human review!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-serif font-bold mb-8">People also viewed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ProductCard product={item} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
