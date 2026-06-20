import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col pt-4">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-8">About Us</h1>
        <div className="prose prose-lg dark:prose-invert">
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            KaliSoft AI eMarketplace is your premier destination for quality products, specializing in industrial packaging, sustainable tableware, and eco-friendly solutions.
          </p>
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <p>
              We believe in bringing together carefully curated products that meet our high standards for quality, sustainability, and value. Our platform is designed to provide a seamless shopping experience for both consumers and businesses.
            </p>
            <p>
              Founded with the vision of making eco-friendly and industrial products more accessible, we continue to expand our catalog while maintaining our commitment to exceptional customer service and environmental responsibility.
            </p>
            <div className="mt-12 p-8 bg-muted rounded-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Values</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Quality without compromise</li>
                <li>Sustainable practices</li>
                <li>Customer-first approach</li>
                <li>Transparent pricing</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
