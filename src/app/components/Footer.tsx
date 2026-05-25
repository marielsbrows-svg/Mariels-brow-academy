import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-charcoal text-cream">
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid md:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div>
            <div
              className="text-4xl text-cream mb-1 italic font-light"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Mariels
            </div>
            <div className="text-[0.58rem] tracking-[0.3em] uppercase text-cream/40 mb-6">
              Brow Academy
            </div>
            <p className="text-cream/50 text-xs leading-relaxed">
              Empowering beauty professionals worldwide through luxury education and transformative artistry.
            </p>
          </div>

          {/* Learn */}
          <div>
            <h3 className="text-[0.58rem] tracking-[0.25em] uppercase text-cream/40 mb-6">Learn</h3>
            <div className="space-y-4">
              <Link to="/courses" className="block text-cream/60 hover:text-cream transition-colors text-xs tracking-wide">
                Browse Courses
              </Link>
              <Link to="/dashboard" className="block text-cream/60 hover:text-cream transition-colors text-xs tracking-wide">
                Student Portal
              </Link>
              <Link to="/community" className="block text-cream/60 hover:text-cream transition-colors text-xs tracking-wide">
                Community
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[0.58rem] tracking-[0.25em] uppercase text-cream/40 mb-6">Company</h3>
            <div className="space-y-4">
              <Link to="/" className="block text-cream/60 hover:text-cream transition-colors text-xs tracking-wide">
                About
              </Link>
              <Link to="/payment" className="block text-cream/60 hover:text-cream transition-colors text-xs tracking-wide">
                Enroll Now
              </Link>
              <Link to="/" className="block text-cream/60 hover:text-cream transition-colors text-xs tracking-wide">
                FAQ
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-[0.58rem] tracking-[0.25em] uppercase text-cream/40 mb-6">Connect</h3>
            <div className="flex gap-3 mb-6">
              <a
                href="https://instagram.com/mariels.brows"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-cream/15 flex items-center justify-center hover:border-cream hover:bg-cream/5 transition-all"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-cream/15 flex items-center justify-center hover:border-cream hover:bg-cream/5 transition-all"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-cream/15 flex items-center justify-center hover:border-cream hover:bg-cream/5 transition-all"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-cream/40 text-xs leading-relaxed tracking-wide">
              @mariels.brows
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cream/08 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-cream/30 text-[0.58rem] tracking-[0.15em] uppercase">
            © 2026 Mariels Brow Academy. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link to="/" className="text-cream/30 hover:text-cream/60 transition-colors text-[0.58rem] tracking-[0.15em] uppercase">
              Privacy
            </Link>
            <Link to="/" className="text-cream/30 hover:text-cream/60 transition-colors text-[0.58rem] tracking-[0.15em] uppercase">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
