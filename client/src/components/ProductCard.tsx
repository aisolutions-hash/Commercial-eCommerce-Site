import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import ImageWithFallback from './ImageWithFallback';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, removeFromCart, toggleWishlist, wishlist } = useStore();
  const isWishlisted = wishlist.includes(product.id);
  const isInCart = cart.some(item => item.product.id === product.id);

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group relative bg-card text-card-foreground rounded-[var(--radius-2xl)] overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <ImageWithFallback 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            containerClassName="w-full h-full"
          />
        </Link>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:text-primary hover:scale-110 transition-all z-10"
        >
          <Heart className={cn("h-5 w-5", isWishlisted && "fill-primary text-primary")} />
        </button>
        {/* Adorable little badge */}
        {product.rating >= 4.8 && (
          <div className="absolute top-3 left-3 bg-primary text-black text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Star className="h-3 w-3 fill-black text-black" /> Top Rated
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
          </Link>
        </div>
        
        <div className="flex items-center gap-1 mb-4">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {product.isContactForPrice ? (
              <div className="font-bold text-base">Contact for Price</div>
            ) : (
              <>
                <div className="font-bold text-xl">Rs. {product.price.toFixed(2)}</div>
                {product.moq && (
                  <div className="text-xs text-muted-foreground mt-1">
                    MOQ: {product.moq} {product.uom || 'units'}
                  </div>
                )}
              </>
            )}
          </div>
          {product.isContactForPrice ? (
            <Link 
              to="/contact"
              className="text-sm font-bold bg-foreground text-background hover:bg-primary hover:text-black px-4 py-2 rounded-full transition-colors"
            >
              Contact Us
            </Link>
          ) : (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                if (isInCart) {
                  removeFromCart(product.id);
                } else {
                  addToCart(product, product.moq || 1); 
                }
              }}
              className={cn(
                "flex items-center justify-center p-3 rounded-full transition-colors",
                isInCart ? "bg-primary text-black" : "bg-foreground text-background hover:bg-primary hover:text-black"
              )}
              aria-label={isInCart ? "Remove from cart" : "Add to cart"}
            >
              <ShoppingCart className={cn("h-5 w-5", isInCart && "fill-black")} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
