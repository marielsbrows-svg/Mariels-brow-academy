import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const COURSE = {
  name: 'Brows to Business',
  price: 69700, // in cents
  displayPrice: '$697',
  installment: '$174.25',
  affirmMin: '$58/mo',
  includes: [
    '30+ Video Lessons (15+ Hours)',
    'Professional Certification',
    'Exclusive Community Access',
    'Business & Marketing Guides',
    'Lifetime Access to All Materials',
  ],
};

const STRIPE_ELEMENT_STYLE = {
  style: {
    base: {
      fontFamily: '"Jost", sans-serif',
      fontSize: '14px',
      color: '#2C2825',
      '::placeholder': { color: 'rgba(92,74,58,0.35)' },
    },
    invalid: { color: '#c0392b' },
  },
};

// ── Inner checkout form (needs Stripe context) ──────────────────────────────
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'card' | 'bnpl'>('card');
  const [bnplProvider, setBnplProvider] = useState<'klarna' | 'afterpay' | 'affirm'>('klarna');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    try {
      // 1. Create PaymentIntent on your backend (Supabase Edge Function)
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: COURSE.price, email, name }),
      });
      const { clientSecret } = await res.json();

      // 2. Confirm payment
      const cardNumber = elements.getElement(CardNumberElement);
      if (!cardNumber) throw new Error('Card element not found');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: { name, email },
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.');
      } else if (paymentIntent?.status === 'succeeded') {
        navigate('/signup?paid=true&email=' + encodeURIComponent(email));
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBNPLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: COURSE.price,
          email,
          payment_method_types: [bnplProvider === 'afterpay' ? 'afterpay_clearpay' : bnplProvider],
        }),
      });
      const { clientSecret } = await res.json();

      const providerMap = {
        klarna: stripe.confirmKlarnaPayment,
        afterpay: stripe.confirmAfterpayClearpayPayment,
        affirm: stripe.confirmAffirmPayment,
      };

      const confirmFn = providerMap[bnplProvider].bind(stripe);
      const { error: stripeError } = await confirmFn(clientSecret, {
        payment_method: { billing_details: { email } },
        return_url: `${window.location.origin}/signup?paid=true&email=${encodeURIComponent(email)}`,
      });

      if (stripeError) setError(stripeError.message || 'Payment failed. Please try again.');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bnplLabels = { klarna: 'Klarna', afterpay: 'Afterpay', affirm: 'Affirm' };

  return (
    <div className="bg-white border border-mocha/20 p-10">
      <h2
        className="font-serif italic text-3xl text-charcoal mb-1"
        style={{ fontFamily: 'Classique Script, cursive' }}
      >
        Secure Checkout
      </h2>
      <p className="text-xs tracking-widest uppercase text-mocha mb-8">256-bit SSL Encrypted</p>

      {/* TABS */}
      <div className="flex border border-mocha/20 mb-8">
        {(['card', 'bnpl'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs tracking-widest uppercase transition-colors ${
              tab === t
                ? 'bg-charcoal text-cream'
                : 'bg-cream text-mocha-dark hover:bg-linen'
            }`}
          >
            {t === 'card' ? 'Credit Card' : 'Pay Later'}
          </button>
        ))}
      </div>

      {/* CARD TAB */}
      {tab === 'card' && (
        <form onSubmit={handleCardSubmit} className="space-y-5">
          <div>
            <label className="block text-xs tracking-widest uppercase text-mocha-dark mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full px-4 py-3 border border-mocha/20 bg-cream text-charcoal text-sm outline-none focus:border-mocha focus:bg-white transition-colors placeholder:text-mocha/30"
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-mocha-dark mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full px-4 py-3 border border-mocha/20 bg-cream text-charcoal text-sm outline-none focus:border-mocha focus:bg-white transition-colors placeholder:text-mocha/30"
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-mocha-dark mb-2">Card Number</label>
            <div className="w-full px-4 py-3 border border-mocha/20 bg-cream focus-within:border-mocha focus-within:bg-white transition-colors">
              <CardNumberElement options={STRIPE_ELEMENT_STYLE} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-mocha-dark mb-2">Expiry</label>
              <div className="w-full px-4 py-3 border border-mocha/20 bg-cream focus-within:border-mocha focus-within:bg-white transition-colors">
                <CardExpiryElement options={STRIPE_ELEMENT_STYLE} />
              </div>
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-mocha-dark mb-2">CVC</label>
              <div className="w-full px-4 py-3 border border-mocha/20 bg-cream focus-within:border-mocha focus-within:bg-white transition-colors">
                <CardCvcElement options={STRIPE_ELEMENT_STYLE} />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs tracking-wide">{error}</p>}

          <button
            type="submit"
            disabled={loading || !stripe}
            className="w-full py-4 bg-charcoal text-cream text-xs tracking-widest uppercase hover:bg-mocha transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
            ) : (
              <>Complete Enrollment — {COURSE.displayPrice}<ArrowRight className="w-3.5 h-3.5" /></>
            )}
          </button>
        </form>
      )}

      {/* BNPL TAB */}
      {tab === 'bnpl' && (
        <form onSubmit={handleBNPLSubmit} className="space-y-5">
          <div>
            <label className="block text-xs tracking-widest uppercase text-mocha-dark mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full px-4 py-3 border border-mocha/20 bg-cream text-charcoal text-sm outline-none focus:border-mocha focus:bg-white transition-colors placeholder:text-mocha/30"
            />
          </div>

          <div className="space-y-3">
            {([
              {
                id: 'klarna' as const,
                label: 'Klarna',
                tagColor: 'bg-[#FFB3C7] text-charcoal',
                detail: `4 payments of ${COURSE.installment}`,
                sub: 'No interest · Every 2 weeks',
              },
              {
                id: 'afterpay' as const,
                label: 'Afterpay',
                tagColor: 'bg-[#B2FCE4] text-charcoal',
                detail: `4 payments of ${COURSE.installment}`,
                sub: 'No interest · Every 2 weeks',
              },
              {
                id: 'affirm' as const,
                label: 'affirm',
                tagColor: 'bg-[#0FA0EA] text-white',
                detail: `From ${COURSE.affirmMin}`,
                sub: '3–36 month plans available',
              },
            ] as const).map((p) => (
              <div
                key={p.id}
                onClick={() => setBnplProvider(p.id)}
                className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                  bnplProvider === p.id
                    ? 'border-charcoal bg-white'
                    : 'border-mocha/20 bg-cream hover:border-mocha hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-sm ${p.tagColor}`}>
                    {p.label}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-charcoal">{p.detail}</div>
                    <div className="text-xs text-mocha-dark">{p.sub}</div>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  bnplProvider === p.id ? 'border-charcoal' : 'border-mocha/30'
                }`}>
                  {bnplProvider === p.id && <div className="w-2 h-2 rounded-full bg-charcoal" />}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-mocha text-center opacity-70">
            You'll be redirected to complete payment securely with {bnplLabels[bnplProvider]}.
          </p>

          {error && <p className="text-red-500 text-xs tracking-wide">{error}</p>}

          <button
            type="submit"
            disabled={loading || !stripe}
            className="w-full py-4 bg-charcoal text-cream text-xs tracking-widest uppercase hover:bg-mocha transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
            ) : (
              <>Continue with {bnplLabels[bnplProvider]} <ArrowRight className="w-3.5 h-3.5" /></>
            )}
          </button>
        </form>
      )}

      <div className="flex items-center justify-center gap-2 mt-5 text-xs text-mocha opacity-60 tracking-wide">
        <ShieldCheck className="w-3.5 h-3.5" />
        Your payment is 100% secure &amp; encrypted
      </div>

      {/* Mini testimonial */}
      <div className="border-t border-mocha/10 mt-6 pt-5">
        <div className="text-mocha text-xs tracking-widest mb-2">★★★★★</div>
        <p className="font-serif italic text-charcoal text-sm leading-relaxed mb-2">
          "Best investment I've made in my career. Paid for itself in my first week."
        </p>
        <p className="text-xs tracking-widest uppercase text-mocha">Sarah M. — Certified Brow Artist</p>
      </div>
    </div>
  );
}

// ── Main Page Component ─────────────────────────────────────────────────────
export const PaymentPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-cream">
        {/* Progress Bar */}
        <div className="bg-linen border-b border-mocha/10 px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-0">
            {['Course', 'Payment', 'Account', 'Dashboard'].map((step, i) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center gap-2 text-xs tracking-widest uppercase ${
                  i === 0 ? 'text-mocha opacity-70' : i === 1 ? 'text-mocha' : 'text-mocha opacity-40'
                }`}>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                    i === 0
                      ? 'bg-mocha border-mocha text-cream'
                      : i === 1
                      ? 'border-mocha'
                      : 'border-mocha/30'
                  }`}>
                    {i === 0 ? '✓' : i + 1}
                  </div>
                  <span className="hidden sm:inline">{step}</span>
                </div>
                {i < 3 && <div className="w-8 sm:w-16 h-px bg-mocha/20 mx-3" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-16 grid lg:grid-cols-[1fr_420px] gap-16 items-start">
          {/* LEFT: Order Summary */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-mocha/20 p-10"
          >
            <p className="text-xs tracking-widest uppercase text-mocha mb-8">Order Summary</p>

            <div className="border-t border-b border-mocha/10 py-8 mb-8">
              <span className="inline-block bg-linen px-3 py-1 text-xs tracking-widest uppercase text-mocha mb-4">
                Signature Program
              </span>
              <h2
                className="text-4xl text-charcoal mb-3 leading-tight"
                style={{ fontFamily: 'Classique Script, cursive' }}
              >
                Brows to Business
              </h2>
              <p className="text-sm text-mocha-dark leading-relaxed mb-6">
                Master professional brow techniques and build a thriving beauty business. Lifetime access included.
              </p>
              <div className="space-y-2.5">
                {COURSE.includes.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-mocha flex-shrink-0" />
                    <span className="text-sm text-mocha-dark">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-mocha-dark">
                <span>Course Price</span><span>{COURSE.displayPrice}</span>
              </div>
              <div className="flex justify-between text-sm text-mocha-dark">
                <span>Discount</span><span className="text-green-600">—</span>
              </div>
            </div>
            <div className="flex justify-between items-baseline border-t border-mocha/10 pt-4">
              <span className="text-xs tracking-widest uppercase text-charcoal">Total Due Today</span>
              <span
                className="text-4xl text-charcoal"
                style={{ fontFamily: 'Classique Script, cursive' }}
              >
                {COURSE.displayPrice}
              </span>
            </div>

            {/* Guarantee */}
            <div className="flex gap-4 bg-linen p-5 mt-8">
              <ShieldCheck className="w-6 h-6 text-mocha flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs tracking-widest uppercase text-charcoal font-semibold mb-1">
                  30-Day Money Back Guarantee
                </p>
                <p className="text-xs text-mocha-dark leading-relaxed">
                  Not satisfied? We'll refund you in full within 30 days — no questions asked.
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Payment Form */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:sticky lg:top-24"
          >
            <CheckoutForm />
          </motion.div>
        </div>
      </div>
    </Elements>
  );
};
