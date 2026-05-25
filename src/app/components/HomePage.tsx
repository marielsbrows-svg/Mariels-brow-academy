import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, CheckCircle, ShieldCheck, BookOpen, Play } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import img1 from '../../imports/IMG_2289.jpg';
import img2 from '../../imports/IMG_2262.jpg';
import img3 from '../../imports/IMG_2321.jpg';
import img4 from '../../imports/2547E751-A8E7-4B55-AF88-AACEA460C257_2.jpg';
import img5 from '../../imports/10162BAE-7F61-4038-9F98-DD000AAB1874.jpg';

// ── Ticker Strip ─────────────────────────────────────────────────────────────
const TickerStrip = () => {
  const items = [
    'Brow Mapping', 'Wax & Tint', 'Lamination', 'Business Building',
    'Client Acquisition', 'Certification', 'Lifetime Access', 'Community',
  ];
  const repeated = [...items, ...items];
  return (
    <div className="bg-charcoal py-3.5 overflow-hidden whitespace-nowrap relative z-20">
      <div className="flex animate-ticker w-max">
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-6 pr-6">
            <span className="text-white/40 text-[0.58rem] tracking-[0.25em] uppercase">{item}</span>
            <span className="text-white/20 text-[0.5rem]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Stacking Section Wrapper ──────────────────────────────────────────────────
const StackSection = ({
  children,
  className = '',
  zIndex = 10,
}: {
  children: React.ReactNode;
  className?: string;
  zIndex?: number;
}) => (
  <div
    className={`sticky top-0 min-h-screen w-full overflow-hidden rounded-b-3xl ${className}`}
    style={{ zIndex }}
  >
    {children}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export const HomePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = [
    { value: '5,000+', label: 'Students Worldwide' },
    { value: '98%', label: 'Success Rate' },
    { value: '$10M+', label: 'Revenue Generated' },
    { value: '4.9/5', label: 'Average Rating' },
  ];

  const features = [
    'Professional brow mapping and shaping techniques',
    'Waxing, tinting, and lamination mastery',
    'Business development and client acquisition',
    'Pricing strategies and financial planning',
    'Marketing and social media for beauty professionals',
    'Lifetime access to all course materials',
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Certified Brow Artist',
      content: 'This academy completely transformed my career. The business guidance is unlike anything else out there.',
    },
    {
      name: 'Jessica C.',
      role: 'Beauty Entrepreneur',
      content: 'From technique to branding — this course gave me everything I needed to build a six-figure brow business.',
    },
    {
      name: 'Emily R.',
      role: 'Salon Owner',
      content: 'The elegance of this program reflects the quality I now bring to my own studio. Truly exceptional.',
    },
  ];

  return (
    <div ref={containerRef} className="bg-charcoal">

      {/* ── SPACER 1 ── */}
      <div className="h-screen" />

      {/* ══════════════════════════════════════════════
          SECTION 1 — VIDEO HERO (white)
      ══════════════════════════════════════════════ */}
      <StackSection className="bg-cream" zIndex={10}>
        <div className="grid lg:grid-cols-2 min-h-screen pt-20">

          {/* Left — Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col justify-center px-10 lg:px-16 py-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-6 h-px bg-mocha/50" />
              <span className="text-[0.58rem] tracking-[0.3em] uppercase text-mocha/60">
                Mariels Brow Academy
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl text-charcoal leading-[1.02] mb-6"
              className="font-playfair"
            >
              Master Your<br />Craft.<br />
              <span className="italic">Build Your</span><br />
              Empire.
            </h1>

            <p className="text-sm text-mocha-dark leading-relaxed max-w-sm mb-10">
              Professional brow training meets business education. Learn from a licensed MA Eyebrow Specialist and build a thriving beauty business — all in one place.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/payment"
                className="inline-flex items-center gap-2 px-8 py-4 bg-charcoal text-cream text-[0.62rem] tracking-[0.2em] uppercase hover:bg-mocha transition-all duration-300"
              >
                Enroll Now — $697
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button className="inline-flex items-center gap-2 px-8 py-4 border border-charcoal text-charcoal text-[0.62rem] tracking-[0.2em] uppercase hover:bg-charcoal hover:text-cream transition-all duration-300">
                <Play className="w-3.5 h-3.5" />
                Watch Our Story
              </button>
            </div>
          </motion.div>

          {/* Right — Video placeholder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative bg-mocha/10 overflow-hidden min-h-[50vh] lg:min-h-full"
          >
            {/* Replace this div with your Vimeo iframe once ready */}
            <div className="absolute inset-0 bg-gradient-to-br from-linen via-mocha/20 to-linen flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-mocha/30 flex items-center justify-center">
                <Play className="w-5 h-5 text-mocha/50 ml-0.5" />
              </div>
              <span className="text-[0.58rem] tracking-[0.2em] uppercase text-mocha/40">
                Your video goes here
              </span>
            </div>

            {/* Vimeo iframe — uncomment and add your video ID when ready */}
            {/*
            <iframe
              src="https://player.vimeo.com/video/YOUR_VIDEO_ID?autoplay=1&loop=1&muted=1&background=1"
              className="absolute inset-0 w-full h-full object-cover"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
            */}

            {/* Badge */}
            <div className="absolute bottom-8 left-8 bg-white px-4 py-3 border-l-2 border-charcoal">
              <div
                className="text-3xl text-charcoal leading-none"
                className="font-playfair"
              >
                5K+
              </div>
              <div className="text-[0.5rem] tracking-[0.15em] uppercase text-mocha/60 mt-1">
                Students Enrolled
              </div>
            </div>
          </motion.div>
        </div>
      </StackSection>

      {/* ── TICKER ── */}
      <div className="relative z-20">
        <TickerStrip />
      </div>

      {/* ── SPACER 2 ── */}
      <div className="h-screen" />

      {/* ══════════════════════════════════════════════
          SECTION 2 — STATS + ABOUT (white)
      ══════════════════════════════════════════════ */}
      <StackSection className="bg-white" zIndex={20}>
        <div className="flex flex-col min-h-screen">

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-mocha/10">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="py-8 px-6 text-center border-r border-mocha/10 last:border-r-0"
              >
                <div
                  className="text-3xl md:text-4xl text-charcoal mb-1"
                  className="font-playfair"
                >
                  {stat.value}
                </div>
                <div className="text-[0.55rem] tracking-[0.2em] uppercase text-mocha/50">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* About Row */}
          <div className="grid lg:grid-cols-2 flex-1">

            {/* Photo */}
            <div className="relative overflow-hidden bg-linen min-h-[40vh]">
              <ImageWithFallback
                src={img4}
                alt="Mariel — MA Eyebrow Specialist"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex flex-col justify-center px-10 lg:px-16 py-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-px bg-mocha/40" />
                <span className="text-[0.58rem] tracking-[0.25em] uppercase text-mocha/50">
                  Meet Your Instructor
                </span>
              </div>

              <h2
                className="text-4xl md:text-5xl text-charcoal leading-tight mb-6"
                className="font-playfair"
              >
                Hi, I'm <span className="italic">Mariel</span><br />
                MA Eyebrow Specialist
              </h2>

              <p className="text-sm text-mocha-dark leading-relaxed mb-6">
                I've spent years mastering the art of brow transformation and building a profitable beauty business from the ground up. Now I'm sharing everything I know so you can do the same.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'Licensed MA Eyebrow Specialist',
                  'Trained 5,000+ students worldwide',
                  'Expert in Wax, Tint & Lamination',
                  'Business coach for beauty professionals',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-mocha-dark border-b border-mocha/08 pb-3">
                    <span className="text-charcoal text-xs">—</span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                to="/payment"
                className="inline-flex items-center gap-2 px-8 py-4 bg-charcoal text-cream text-[0.62rem] tracking-[0.2em] uppercase hover:bg-mocha transition-all duration-300 self-start"
              >
                Start Your Journey
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </StackSection>

      {/* ── SPACER 3 ── */}
      <div className="h-screen" />

      {/* ══════════════════════════════════════════════
          SECTION 3 — BEFORE/AFTER (cream)
      ══════════════════════════════════════════════ */}
      <StackSection className="bg-linen" zIndex={30}>
        <div className="flex flex-col items-center justify-center min-h-screen px-8 py-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-mocha/40" />
            <span className="text-[0.58rem] tracking-[0.25em] uppercase text-mocha/50">Results</span>
            <div className="w-5 h-px bg-mocha/40" />
          </div>

          <h2
            className="text-4xl md:text-5xl text-charcoal text-center mb-12 leading-tight"
            className="font-playfair"
          >
            The <span className="italic">Transformation</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl w-full">
            {[img1, img2, img3].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative aspect-[3/4] overflow-hidden group"
              >
                <ImageWithFallback
                  src={img}
                  alt={`Brow transformation ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                <div className="absolute top-4 left-4 bg-white px-2.5 py-1">
                  <span className="text-[0.5rem] tracking-[0.15em] uppercase text-charcoal">Before / After</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </StackSection>

      {/* ── SPACER 4 ── */}
      <div className="h-screen" />

      {/* ══════════════════════════════════════════════
          SECTION 4 — COURSE (dark/charcoal)
      ══════════════════════════════════════════════ */}
      <StackSection className="bg-charcoal" zIndex={40}>
        <div className="flex flex-col items-center justify-center min-h-screen px-8 py-20">

          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-white/20" />
            <span className="text-[0.58rem] tracking-[0.25em] uppercase text-white/30">Signature Program</span>
            <div className="w-5 h-px bg-white/20" />
          </div>

          <h2
            className="text-4xl md:text-5xl text-cream text-center mb-12"
            className="font-playfair"
          >
            Brows to <span className="italic">Business</span>
          </h2>

          <div className="grid lg:grid-cols-2 border border-white/10 max-w-4xl w-full">

            {/* Course Image */}
            <div className="relative overflow-hidden min-h-[320px] bg-charcoal/50">
              <ImageWithFallback
                src={img5}
                alt="Brows to Business Course"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
            </div>

            {/* Course Info */}
            <div className="p-10 bg-charcoal/80">
              <div className="inline-block border border-white/15 px-3 py-1 text-[0.52rem] tracking-[0.15em] uppercase text-white/40 mb-5">
                Lifetime Access
              </div>

              <h3
                className="text-3xl text-cream italic mb-4"
                className="font-playfair"
              >
                Brows to Business
              </h3>

              <p className="text-[0.78rem] text-white/40 leading-relaxed mb-6">
                The complete system — from mastering professional brow techniques to building a thriving, profitable beauty business.
              </p>

              <ul className="space-y-2 mb-6">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-[0.7rem] text-white/40 pb-2 border-b border-white/05">
                    <span className="text-white/20 mt-0.5">—</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div
                className="text-4xl text-cream mb-6"
                className="font-playfair"
              >
                $697
              </div>

              <Link
                to="/payment"
                className="flex items-center justify-center gap-2 w-full py-4 bg-cream text-charcoal text-[0.62rem] tracking-[0.2em] uppercase hover:bg-linen transition-all duration-300"
              >
                Enroll Now
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <p className="text-center text-[0.55rem] text-white/20 tracking-widest uppercase mt-3">
                Klarna · Afterpay · Affirm Available
              </p>
            </div>
          </div>
        </div>
      </StackSection>

      {/* ── SPACER 5 ── */}
      <div className="h-screen" />

      {/* ══════════════════════════════════════════════
          SECTION 5 — TESTIMONIALS (warm cream)
      ══════════════════════════════════════════════ */}
      <StackSection className="bg-cream" zIndex={50}>
        <div className="flex flex-col items-center justify-center min-h-screen px-8 py-20">

          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-mocha/40" />
            <span className="text-[0.58rem] tracking-[0.25em] uppercase text-mocha/50">Student Results</span>
            <div className="w-5 h-px bg-mocha/40" />
          </div>

          <h2
            className="text-4xl md:text-5xl text-charcoal text-center mb-12"
            className="font-playfair"
          >
            Words From Our <span className="italic">Students</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-px max-w-5xl w-full bg-mocha/10">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="bg-white p-8"
              >
                <div className="text-charcoal text-xs tracking-[0.2em] mb-4">★★★★★</div>
                <p
                  className="text-lg text-charcoal italic leading-relaxed mb-6"
                  className="font-playfair"
                >
                  "{t.content}"
                </p>
                <div className="border-t border-mocha/10 pt-4">
                  <div className="text-[0.6rem] tracking-[0.15em] uppercase text-charcoal font-medium">{t.name}</div>
                  <div className="text-[0.58rem] tracking-[0.1em] text-mocha/60 uppercase mt-1">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </StackSection>

      {/* ── SPACER 6 ── */}
      <div className="h-screen" />

      {/* ══════════════════════════════════════════════
          SECTION 6 — FINAL CTA (dark)
      ══════════════════════════════════════════════ */}
      <StackSection className="bg-charcoal" zIndex={60}>
        <div className="flex flex-col items-center justify-center min-h-screen px-8 py-20 text-center">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-5 h-px bg-white/20" />
              <span className="text-[0.58rem] tracking-[0.25em] uppercase text-white/30">Begin Your Journey</span>
              <div className="w-5 h-px bg-white/20" />
            </div>

            <h2
              className="text-5xl md:text-7xl text-cream leading-tight mb-6"
              className="font-playfair"
            >
              Ready to Build<br />Your <span className="italic">Brow Empire?</span>
            </h2>

            <p className="text-sm text-white/40 tracking-wide max-w-md mx-auto mb-12 leading-relaxed">
              Join thousands of students who have transformed their passion into a profitable beauty career.
            </p>

            <Link
              to="/payment"
              className="inline-flex items-center gap-2 px-12 py-5 bg-cream text-charcoal text-[0.65rem] tracking-[0.25em] uppercase hover:bg-linen transition-all duration-300 shadow-2xl"
            >
              Enroll Now — $697
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center justify-center gap-2 mt-5 text-[0.55rem] text-white/20 tracking-widest uppercase">
              <ShieldCheck className="w-3 h-3" />
              30-Day Money Back Guarantee · Klarna · Afterpay · Affirm
            </div>
          </motion.div>
        </div>
      </StackSection>

      {/* Final spacer */}
      <div className="h-screen" />

    </div>
  );
};
