import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSent(true);
    } catch {
      setError('Failed to send. Please email us directly at ai.solutions@kalisoftai.in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-4">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-8">Contact Us</h1>
        <p className="text-xl text-muted-foreground leading-relaxed mb-12">
          We'd love to hear from you. Please reach out with any questions, concerns, or feedback.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Email</h3>
                <p className="text-muted-foreground">ai.solutions@kalisoftai.in</p>
                <p className="text-sm text-muted-foreground mt-2">We aim to respond to all emails within 24 hours.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Phone</h3>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
                <p className="text-sm text-muted-foreground mt-2">Monday-Friday, 9am-5pm EST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Office</h3>
                <p className="text-muted-foreground">123 Innovation Drive<br/>Tech District, CA 94043<br/>United States</p>
              </div>
            </div>
          </div>

          <div className="bg-muted border border-border rounded-3xl p-8">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
                {error && (
                  <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
                    {error}
                  </div>
                )}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
                    <input
                      type="text" id="name" required
                      value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                    <input
                      type="email" id="email" required
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="message">Message</label>
                    <textarea
                      id="message" rows={4} required
                      value={message} onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-black font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
