import { motion, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, CheckCircle, Award, Users, BookOpen, Play } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { useRef } from 'react';
import img1 from '../../imports/IMG_2289.jpg';
import img2 from '../../imports/IMG_2262.jpg';
import img3 from '../../imports/IMG_2321.jpg';
import img4 from '../../imports/2547E751-A8E7-4B55-AF88-AACEA460C257_2.jpg';
import img5 from '../../imports/10162BAE-7F61-4038-9F98-DD000AAB1874.jpg';

export const HomePage = () => {
  const fadeInUp = {
    initial: { y: 60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6, ease: 'easeOut' },
  };

  // Scroll animation refs
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Brand Name & CTA */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center lg:text-left"
            >
              <h1
                className="text-6xl md:text-7xl lg:text-8xl text-charcoal mb-6 leading-tight"
                style={{ fontFamily: 'Classique Script, cursive' }}
              >
                Mariels Brow Academy
              </h1>

              <p className="text-base md:text-lg text-mocha-dark mb-8 leading-relaxed max-w-xl">
                Master the art of brow transformation. Learn professional techniques, build your business, and join a community of elite brow artists.
              </p>

              <Link
                to="/payment"
                className="inline-block px-10 py-4 bg-charcoal text-cream tracking-widest uppercase text-sm hover:bg-mocha transition-all duration-300 shadow-lg"
              >
                Start Your Journey
              </Link>
            </motion.div>

            {/* Right - Video */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full"
            >
              <div className="relative aspect-video bg-charcoal shadow-2xl overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=0&rel=0&modestbranding=1"
                  title="Mariels Brow Academy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Layered Scroll Effect Section */}
      <section ref={scrollRef} className="relative bg-cream">
        {/* Card 1 - Coffee/Workspace */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="sticky top-24 z-10 mx-auto max-w-5xl px-6 py-12"
        >
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-white">
            <div className="relative aspect-[16/10]">
              <ImageWithFallback
                src={img1}
                alt="Makeup artist at work"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 to-transparent"></div>
            </div>
          </div>
        </motion.div>

        {/* Card 2 - Build Your Empire */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 100 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="sticky top-32 z-20 mx-auto max-w-5xl px-6 py-12"
        >
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-white">
            <div className="relative aspect-[16/10]">
              <ImageWithFallback
                src={img2}
                alt="Build your empire"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-charcoal/40 flex flex-col items-center justify-center text-center px-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <p className="text-white text-sm md:text-base tracking-[0.3em] uppercase mb-4">
                    Build Your Empire:
                  </p>
                  <h2 className="text-white text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight" style={{ fontFamily: 'Classique Script, cursive' }}>
                    Create Digital Products
                  </h2>
                  <p className="text-white/90 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                    Once you understand what people want, create products that solve their problems. This is how you build true passive income - create
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 3 - Beauty Professional */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 100 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="sticky top-40 z-30 mx-auto max-w-5xl px-6 py-12"
        >
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-white">
            <div className="relative aspect-[16/10]">
              <ImageWithFallback
                src={img3}
                alt="Professional brow tools"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <h3 className="text-white text-4xl md:text-6xl mb-4" style={{ fontFamily: 'Classique Script, cursive' }}>
                    Master Your Craft
                  </h3>
                  <p className="text-white/90 text-sm md:text-base max-w-xl leading-relaxed">
                    Transform your passion into profit with professional training and business strategies
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Spacer to allow scroll */}
        <div className="h-96"></div>
      </section>

      {/* Prestige Indicators */}
      <section className="py-16 bg-white border-y border-mocha/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '5,000+', label: 'Students Worldwide' },
              { value: '98%', label: 'Success Rate' },
              { value: '$10M+', label: 'Revenue Generated' },
              { value: '4.9/5', label: 'Average Rating' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="font-serif text-3xl md:text-4xl text-charcoal mb-1">{stat.value}</div>
                <div className="text-sm tracking-wider uppercase text-mocha-dark">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Collections - Product Showcase Style */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif italic text-5xl md:text-6xl text-charcoal mb-4">
              Our Signature Course
            </h2>
            <p className="text-lg text-mocha-dark max-w-2xl mx-auto">
              A comprehensive program designed to transform you into a successful brow artist
            </p>
          </motion.div>

          {/* Featured Course - Brows to Business */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white shadow-2xl overflow-hidden">
              {/* Content */}
              <div className="p-12 lg:p-16 flex flex-col justify-center max-w-3xl mx-auto">
                <div className="inline-block px-4 py-1.5 bg-linen rounded-full mb-6 self-start">
                  <span className="text-xs tracking-widest uppercase text-mocha">Signature Program</span>
                </div>
                
                <h3 className="font-serif italic text-4xl md:text-5xl text-charcoal mb-4">
                  Brows to Business
                </h3>
                
                <p className="text-mocha-dark leading-relaxed mb-6 text-lg">
                  Master the complete journey from foundational brow techniques to building a thriving, profitable beauty business. This comprehensive course covers everything you need to become a certified brow artist and successful entrepreneur.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    'Professional brow mapping and shaping techniques',
                    'Waxing, tinting, and lamination mastery',
                    'Business development and client acquisition',
                    'Pricing strategies and financial planning',
                    'Marketing and social media for beauty professionals',
                    'Lifetime access to all course materials',
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-mocha flex-shrink-0 mt-0.5" />
                      <span className="text-mocha-dark text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-mocha/10 pt-6 mb-8">
                  <div className="flex items-center gap-6 text-sm text-mocha-dark">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span className="tracking-wider uppercase text-xs">30+ Lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span className="tracking-wider uppercase text-xs">15+ Hours</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/payment"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-charcoal text-cream tracking-widest uppercase text-sm hover:bg-mocha transition-all duration-300 shadow-lg hover:shadow-xl justify-center"
                >
                  Enroll Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Additional Info Cards */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto"
          >
            {[
              {
                title: 'Certification',
                description: 'Receive a professional certificate upon completion to showcase your expertise',
              },
              {
                title: 'Community Access',
                description: 'Join our exclusive network of brow artists and beauty professionals',
              },
              {
                title: 'Flexible Learning',
                description: 'Learn at your own pace with lifetime access to all course content',
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 shadow-md text-center">
                <h4 className="font-serif text-xl text-charcoal mb-2">{feature.title}</h4>
                <p className="text-sm text-mocha-dark leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-block px-4 py-1.5 bg-linen rounded-full mb-6">
              <span className="text-sm tracking-widest uppercase text-mocha">Our Philosophy</span>
            </div>
            <h2 className="font-serif italic text-4xl md:text-5xl text-charcoal mb-6 leading-tight">
              Excellence is
              <span className="block text-mocha">Our Standard</span>
            </h2>
            <p className="text-lg text-mocha-dark leading-relaxed mb-6">
              At Mariels Brow Academy, we believe that true mastery comes from the perfect blend of classical technique and modern innovation. Our curriculum is designed not just to teach skills, but to cultivate artistry.
            </p>
            <p className="text-lg text-mocha-dark leading-relaxed mb-12">
              Each course is meticulously crafted to ensure you receive the highest quality education, empowering you to build a thriving, profitable business in the luxury beauty industry.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {[
                'Lifetime access to all course materials',
                'Professional certification upon completion',
                'Exclusive community of industry professionals',
                'Business development and marketing guidance',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-mocha flex-shrink-0 mt-1" />
                  <span className="text-mocha-dark">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials - Refined */}
      <section className="py-24 bg-linen">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif italic text-4xl md:text-5xl text-charcoal mb-4">
              Words from Our Students
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah M.',
                role: 'Certified Brow Artist',
                content: 'This academy completely transformed my career trajectory. The attention to detail and business guidance is unmatched.',
              },
              {
                name: 'Emily R.',
                role: 'Salon Owner',
                content: 'The elegance and professionalism of this program reflects the quality I now bring to my own studio. Truly exceptional.',
              },
              {
                name: 'Jessica C.',
                role: 'Beauty Entrepreneur',
                content: 'From technique to branding, this course gave me everything I needed to build a six-figure brow business.',
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 shadow-md"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-mocha" />
                  ))}
                </div>
                <p className="text-mocha-dark leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="border-t border-mocha/10 pt-4">
                  <div className="font-medium text-charcoal tracking-wide">{testimonial.name}</div>
                  <div className="text-sm text-mocha-dark tracking-wider uppercase mt-1">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-charcoal text-cream">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif italic text-4xl md:text-6xl mb-6">
              Begin Your Journey
            </h2>
            <p className="text-lg md:text-xl text-cream/80 mb-12 leading-relaxed max-w-2xl mx-auto">
              Join the distinguished community of artists who have elevated their craft and transformed their lives through Mariels Brow Academy.
            </p>
            <Link
              to="/payment"
              className="inline-flex items-center gap-2 px-10 py-5 bg-cream text-charcoal tracking-widest uppercase text-sm hover:bg-linen transition-all duration-300 shadow-xl"
            >
              Explore Courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
