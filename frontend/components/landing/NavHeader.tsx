'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Compass } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
  { label: 'What is it?', href: '#what-is-navigate-ai' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Languages', href: '#multilingual' },
  { label: 'Metrics', href: '#research' },
  { label: 'Architecture', href: '#architecture' },
];

export default function NavHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMenuOpen(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0D10]/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Compass
                className="w-7 h-7 text-[#63E6D1] transition-transform duration-300 group-hover:rotate-45"
                strokeWidth={1.5}
              />
              <div className="absolute inset-0 blur-md bg-[#63E6D1]/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-[#F4F7F8] font-semibold text-lg tracking-wide">
              Navigate<span className="text-[#63E6D1]">AI</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-[#F4F7F8]/60 hover:text-[#63E6D1] text-sm font-medium transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/navigation"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#63E6D1]/10 border border-[#63E6D1]/30 text-[#63E6D1] text-sm font-medium hover:bg-[#63E6D1]/20 hover:border-[#63E6D1]/60 transition-all duration-200"
            >
              Launch App
            </Link>
            <button
              className="md:hidden p-2 text-[#F4F7F8]/70 hover:text-[#63E6D1] transition-colors duration-200"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#0A0D10]/95 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-[#F4F7F8]/70 hover:text-[#63E6D1] text-sm font-medium py-2 transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/navigation"
                className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#63E6D1]/10 border border-[#63E6D1]/30 text-[#63E6D1] text-sm font-medium hover:bg-[#63E6D1]/20 transition-all duration-200"
              >
                Launch App
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
