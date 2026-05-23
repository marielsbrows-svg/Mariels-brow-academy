import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-charcoal text-cream">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="font-serif italic text-4xl text-cream mb-2">Mariels</div>
            <div className="text-xs tracking-[0.25em] uppercase text-chrome/80 mb-6">
              Brow Academy
            </div>
            <p className="text-cream/60 text-sm leading-relaxed">
              Empowering beauty professionals worldwide through luxury education and transformative artistry.
            </p>
          </div>

          <div>
            <h3 className="text-xs tracking-widest uppercase text-chrome mb-6">Learn</h3>
            <div className="space-y-3">
              <Link to="/courses" className="block text-cream/70 hover:text-cream transition-colors text-sm">
                Browse Courses
              </Link>
              <Link to="/dashboard" className="block text-cream/70 hover:text-cream transition-colors text-sm">
                Student Portal
              </Link>
              <Link to="/" className="block text-cream/70 hover:text-cream transition-colors text-sm">
                Success Stories
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs tracking-widest uppercase text-chrome mb-6">Company</h3>
            <div className="space-y-3">
              <Link to="/" className="block text-cream/70 hover:text-cream transition-colors text-sm">
                About
              </Link>
              <Link to="/" className="block text-cream/70 hover:text-cream transition-colors text-sm">
                Contact
              </Link>
              <Link to="/" className="block text-cream/70 hover:text-cream transition-colors text-sm">
                FAQ
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs tracking-widest uppercase text-chrome mb-6">Connect</h3>
            <div className="flex gap-3 mb-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-cream/20 flex items-center justify-center hover:border-cream hover:bg-cream/5 transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-cream/20 flex items-center justify-center hover:border-cream hover:bg-cream/5 transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-cream/20 flex items-center justify-center hover:border-cream hover:bg-cream/5 transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
            <p className="text-cream/60 text-sm leading-relaxed">
              Follow for daily inspiration
            </p>
          </div>
        </div>

        <div className="border-t border-cream/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-cream/40 text-xs tracking-wider">
            © 2026 Mariels Brow Academy. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link to="/" className="text-cream/40 hover:text-cream/70 transition-colors text-xs tracking-wider">
              Privacy
            </Link>
            <Link to="/" className="text-cream/40 hover:text-cream/70 transition-colors text-xs tracking-wider">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};