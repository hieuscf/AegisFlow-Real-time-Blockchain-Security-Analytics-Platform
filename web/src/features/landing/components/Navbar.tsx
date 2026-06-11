import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Security', href: '#security' },
  { label: 'Docs', href: '#' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-aegis-bg/90 backdrop-blur-xl border-b border-aegis-border/50 shadow-2xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aegis-primary to-aegis-secondary flex items-center justify-center glow-primary transition-all group-hover:scale-105">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z"
                    fill="white"
                  />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-aegis-primary/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-base font-bold text-white">
              Aegis<span className="gradient-primary">Flow</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-aegis-muted hover:text-white transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-aegis-primary to-aegis-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ConnectButton chainStatus="none" showBalance={false} accountStatus="avatar" />
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-aegis-primary text-aegis-bg hover:bg-aegis-primary/90 transition-all glow-primary active:scale-95"
            >
              Dashboard
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-aegis-muted hover:text-white transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-aegis-surface/95 backdrop-blur-xl border-b border-aegis-border"
          >
            <div className="px-4 py-5 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-2.5 text-aegis-muted hover:text-white rounded-lg hover:bg-aegis-card transition-all text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="space-y-3 pt-3 border-t border-aegis-border mt-3">
                <ConnectButton chainStatus="none" showBalance={false} />
                <Link
                  to="/dashboard"
                  className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-aegis-primary text-aegis-bg"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
