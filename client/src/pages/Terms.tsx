import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col pt-4">
      <Navbar />
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-lg dark:prose-invert text-muted-foreground space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using KaliSoft AI eMarketplace, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on our website for personal, non-commercial transitory viewing only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Products and Pricing</h2>
            <p>
              We reserve the right to modify or discontinue any product at any time without notice. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the products.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws, without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
