import { useState } from 'react';
import { Globe, Menu, X } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations.ts';
import type { Language, NavPage } from '../types/index.ts';
import { Logo } from './Logo.tsx';

interface NavbarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  language: Language;
  onToggleLanguage: () => void;
}

export function Navbar({ activePage, onNavigate, language, onToggleLanguage }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = TRANSLATIONS[language];

  const navItems: Array<{ id: NavPage; label: string }> = [
    { id: 'home', label: t.nav.home },
    { id: 'study', label: t.nav.study },
    { id: 'quiz', label: t.nav.quiz },
    { id: 'chat', label: t.nav.chat },
    { id: 'settings', label: t.nav.settings },
  ];

  const handleNavClick = (page: NavPage) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1E1B4B] border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark + Inline SVG Logo */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded-lg py-1 cursor-pointer"
          aria-label="EduGenius AI Home"
        >
          <Logo variant="light" />
        </button>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Primary Navigation">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded px-1 ${
                  isActive
                    ? 'text-white'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute inset-x-1 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action (Language Switcher) + Mobile Hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            aria-label={language === 'bn' ? 'Switch to English' : 'বাংলা ভাষায় পরিবর্তন করুন'}
          >
            <Globe className="w-3.5 h-3.5 text-violet-300" aria-hidden="true" />
            <span>{t.langToggle}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-indigo-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          className="md:hidden bg-[#191640] border-t border-white/10 px-4 py-3 space-y-1"
          aria-label="Mobile Navigation"
        >
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#4338CA] text-white'
                    : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
