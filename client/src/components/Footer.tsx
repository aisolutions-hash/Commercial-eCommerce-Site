import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 dark:bg-zinc-900 text-zinc-50 py-12 mt-20 rounded-t-[2.5rem]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xl">K</div>
              <span className="font-bold text-xl tracking-tight">KaliSoft <span className="text-primary">AI</span></span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Your one-stop marketplace for industrial packaging, eco-friendly goods, and more. Quality delivered.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/categories?id=industrial-packaging" className="hover:text-primary transition-colors">Industrial Packaging</Link></li>
              <li><Link to="/categories?id=sustainable-tableware" className="hover:text-primary transition-colors">Sustainable Tableware</Link></li>
              <li><Link to="/categories?id=eco-honeycomb" className="hover:text-primary transition-colors">Eco Honeycomb</Link></li>
              <li><Link to="/categories?id=tote-bags" className="hover:text-primary transition-colors">Tote Bags</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">Subscribe for updates and exclusive offers.</p>
            <form className="flex gap-2">
              <input type="email" placeholder="Email address" className="bg-gray-800 text-white px-4 py-2 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              <button type="submit" className="bg-primary hover:bg-primary-dark text-black px-4 py-2 rounded-full font-medium transition-colors text-sm">
                Join
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} KaliSoft AI Marketplace &nbsp;·&nbsp;   All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
