import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  buttonText?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Industrial Packaging Solutions",
    subtitle: "Heavy-duty packaging for commercial and industrial use.",
    image: "https://images.pexels.com/photos/27111449/pexels-photo-27111449.jpeg?_gl=1*fq9z5o*_ga*MTI5NDYxMTI0NS4xNzc3MzcxMTc5*_ga_8JE65Q40S6*czE3NzczNzExNzgkbzEkZzEkdDE3NzczNzEyNTgkajQyJGwwJGgw",
    link: "/categories?id=industrial-packaging"
  },
  {
    id: 2,
    title: "Sustainable Tableware",
    subtitle: "Eco-friendly plates and bowls made from sugarcane waste.",
    image: "https://images.pexels.com/photos/8251778/pexels-photo-8251778.jpeg?_gl=1*19pus8i*_ga*MTI5NDYxMTI0NS4xNzc3MzcxMTc5*_ga_8JE65Q40S6*czE3NzczNzExNzgkbzEkZzEkdDE3NzczNzE1MjMkajU5JGwwJGgw",
    link: "/categories?id=sustainable-tableware"
  },
  {
    id: 3,
    title: "Eco Honeycomb Covers",
    subtitle: "Innovative and sustainable honeycomb paper packaging.",
    image: "https://images.pexels.com/photos/12515076/pexels-photo-12515076.jpeg?_gl=1*jtuhif*_ga*MTI5NDYxMTI0NS4xNzc3MzcxMTc5*_ga_8JE65Q40S6*czE3NzczNzExNzgkbzEkZzEkdDE3NzczNzE1NjQkajE4JGwwJGgw",
    link: "/categories?id=eco-honeycomb"
  },
  {
    id: 4,
    title: "Eco-Friendly Tote Bags",
    subtitle: "Stylish, reusable, and durable tote bags for everyday carry.",
    image: "https://images.pexels.com/photos/30037036/pexels-photo-30037036.jpeg?_gl=1*1is71p*_ga*MTI5NDYxMTI0NS4xNzc3MzcxMTc5*_ga_8JE65Q40S6*czE3NzczNzExNzgkbzEkZzEkdDE3NzczNzE2MzckajgkbDAkaDA.",
    link: "/categories?id=tote-bags"
  },
  {
    id: 5,
    title: "Advertise With Us",
    subtitle: "Reach thousands of industrial packaging buyers every day. Blend seamlessly into our marketplace.",
    image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
    link: "#",
    buttonText: "Learn More"
  },
  {
    id: 6,
    title: "Tanvi Enterprises",
    subtitle: "Your trusted partner for quality products and services.",
    image: "/tanvi%20enterprises.jpeg",
    link: "#",
    buttonText: "Learn More"
  },
  {
    id: 7,
    title: "Shree Krishna Enterprises",
    subtitle: "Delivering excellence and quality you can depend on.",
    image: "/shree%20krishna%20enterprises.jpeg",
    link: "#",
    buttonText: "Learn More"
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((current + 1) % slides.length);
  const prev = () => setCurrent((current - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden rounded-[2.5rem] my-8 shadow-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <ImageWithFallback 
            src={slides[current].image} 
            alt={slides[current].title}
            className="w-full h-full object-cover"
            containerClassName="absolute inset-0 w-full h-full"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 text-white">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-serif font-bold mb-4 text-balance drop-shadow-md"
            >
              {slides[current].title}
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl max-w-2xl text-gray-200 mb-8 drop-shadow"
            >
              {slides[current].subtitle}
            </motion.p>
            <motion.div
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.6 }}
            >
              <Link 
                to={slides[current].link}
                className="bg-primary hover:bg-primary-dark text-black px-8 py-3 rounded-full font-bold text-lg transition-transform hover:scale-105 active:scale-95 inline-block"
              >
                {slides[current].buttonText || "Shop Now"}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur text-white transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur text-white transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === current ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
