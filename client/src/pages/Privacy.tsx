import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col pt-4">
      <Navbar />
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-lg dark:prose-invert text-muted-foreground space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, such as when you create an account, making a purchase, or contacting customer support. This may include your name, email address, shipping address, and payment information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to securely process your orders, communicate with you about your purchases, and improve our services. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against accidental or unlawful destruction, loss, alteration, or unauthorized disclosure or access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at ai.solutions@kalisoftai.in.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
