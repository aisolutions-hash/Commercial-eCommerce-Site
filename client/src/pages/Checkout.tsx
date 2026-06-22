import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useStore } from '../store';
import { Trash2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ImageWithFallback from '../components/ImageWithFallback';
import { placeOrder } from '../lib/api';

export default function Checkout() {
  const { cart, updateQuantity, removeFromCart, clearCart, user, token } = useStore();
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + tax + shipping;

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      navigate('/auth?redirect=/checkout');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const items = cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));
      await placeOrder(items);
      clearCart();
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'success') {
     return (
        <div className="min-h-screen flex flex-col pt-4">
          <Navbar />
          <main className="flex-grow flex items-center justify-center p-4">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-card border border-border p-8 md:p-16 rounded-[3rem] text-center max-w-xl shadow-xl"
             >
               <motion.div
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ type: "spring", delay: 0.2 }}
                 className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
               >
                 <CheckCircle2 className="w-12 h-12 text-primary" />
               </motion.div>
               <h1 className="text-4xl font-serif font-bold mb-4">Order Confirmed!</h1>
               <p className="text-muted-foreground text-lg mb-8">Thank you for shopping at KaliSoft AI Marketplace. Your order is being processed.</p>
               <Link to="/" className="bg-foreground text-background px-8 py-3 rounded-full font-bold hover:bg-primary hover:text-black transition-colors block w-full sm:w-auto">
                 Continue Shopping
               </Link>
             </motion.div>
          </main>
          <Footer />
        </div>
     )
  }

  return (
    <div className="min-h-screen flex flex-col pt-4">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-8">
          {step === 'cart' ? 'Your Cart' : 'Checkout'}
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            
            {step !== 'cart' && (
              <div className="flex items-center gap-4 text-sm font-medium mb-8">
                <button onClick={() => setStep('cart')} className="text-muted-foreground hover:text-primary transition-colors">Cart</button>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <button onClick={() => setStep('shipping')} className={step === 'shipping' ? "text-foreground font-bold" : "text-muted-foreground"}>Shipping</button>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className={step === 'payment' ? "text-foreground font-bold" : "text-muted-foreground"}>Payment</span>
              </div>
            )}

            {step === 'cart' && (
              cart.length > 0 ? (
                <div className="space-y-6">
                  <AnimatePresence>
                    {cart.map(item => (
                      <motion.div 
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-4 p-4 border border-border rounded-[2rem] bg-card shadow-sm"
                      >
                        <ImageWithFallback src={item.product.images[0]} alt={item.product.name} className="w-24 h-24 object-cover" containerClassName="w-24 h-24 rounded-xl shrink-0" />
                        <div className="flex-1">
                          <Link to={`/product/${item.product.id}`} className="font-bold text-lg hover:text-primary transition-colors line-clamp-1">{item.product.name}</Link>
                          <div className="text-lg font-light">Rs. {item.product.price.toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-muted rounded-full p-1">
                            <button onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-colors">-</button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-colors">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-20 bg-muted rounded-[3rem]">
                  <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
                  <Link to="/categories" className="bg-primary text-black font-bold px-8 py-3 rounded-full hover:bg-primary-dark transition-colors">
                    Start Shopping
                  </Link>
                </div>
              )
            )}

            {step === 'shipping' && (
              <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 bg-card border border-border p-6 md:p-8 rounded-[2rem] shadow-sm" onSubmit={(e) => { e.preventDefault(); setStep('payment'); }}>
                <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">First Name</label>
                    <input required type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Last Name</label>
                    <input required type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Address</label>
                    <input required type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">City</label>
                    <input required type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Zip Code</label>
                    <input required type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-foreground text-background px-8 py-3 rounded-full font-bold hover:bg-primary-dark transition-colors">Continue to Payment</button>
                </div>
              </motion.form>
            )}

            {step === 'payment' && (
              <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 bg-card border border-border p-6 md:p-8 rounded-[2rem] shadow-sm" onSubmit={handleCompleteOrder}>
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-4 p-4 border border-primary rounded-xl bg-primary/5 cursor-pointer">
                    <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-primary focus:ring-primary" />
                    <span className="font-medium">Credit / Debit Card</span>
                  </label>
                  <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-muted transition-colors">
                    <input type="radio" name="payment" className="w-4 h-4 text-primary focus:ring-primary" />
                    <span className="font-medium">PayPal</span>
                  </label>
                </div>

                <div className="space-y-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Card Number</label>
                    <input required type="text" placeholder="0000 0000 0000 0000" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                      <label className="block text-sm font-medium mb-2 text-muted-foreground">Expiry Date</label>
                      <input required type="text" placeholder="MM/YY" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                     </div>
                     <div>
                      <label className="block text-sm font-medium mb-2 text-muted-foreground">CVC</label>
                      <input required type="text" placeholder="123" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                     </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-between items-center">
                  <button type="button" onClick={() => setStep('shipping')} className="text-muted-foreground hover:text-foreground font-medium">Back</button>
                  <button type="submit" disabled={submitting} className="bg-primary text-black px-8 py-3 rounded-full font-bold hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50">
                    <ShieldCheck className="w-5 h-5" /> {submitting ? 'Processing...' : `Pay Rs. ${total.toFixed(2)}`}
                  </button>
                </div>
              </motion.form>
            )}

          </div>

          {cart.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-[2rem] p-6 sticky top-24 shadow-sm">
                <h3 className="font-bold text-xl mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({cart.length} items)</span>
                    <span className="text-foreground">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (8%)</span>
                    <span className="text-foreground">Rs. {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-foreground">{shipping === 0 ? 'Free' : `Rs. ${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </div>
                </div>

                {step === 'cart' && (
                  <button 
                    onClick={() => {
                      if (!token) {
                        navigate('/auth?redirect=/checkout');
                      } else {
                        setStep('shipping');
                      }
                    }}
                    className="w-full bg-foreground text-background py-4 rounded-full font-bold hover:bg-primary hover:text-black transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                )}

                <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Checkout
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
