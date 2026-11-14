import { TRANSLATIONS } from '../i18n/translations.ts';
import type { Language, NavPage } from '../types/index.ts';
import { Logo } from './Logo.tsx';

interface FooterProps {
  language: Language;
  onNavigate: (page: NavPage) => void;
}

export function Footer({ language, onNavigate }: FooterProps) {
  const t = TRANSLATIONS[language];

  const links: Array<{ id: NavPage; label: string }> = [
    { id: 'home', label: t.nav.home },
    { id: 'study', label: t.nav.study },
    { id: 'quiz', label: t.nav.quiz },
    { id: 'chat', label: t.nav.chat },
    { id: 'settings', label: t.nav.settings },
  ];

  return (
    <footer className="bg-[#1E1B4B] text-indigo-100 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/10">
          <div className="space-y-3">
            <Logo variant="light" />
            <p className="text-sm text-indigo-200/90 leading-relaxed max-w-sm">
              {t.footer.tagline}
            </p>
            <p className="text-xs font-medium text-violet-300">
              {t.company}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">{t.footer.productTitle}</h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.id)}
                    className="text-sm text-indigo-200 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">{t.footer.supportTitle}</h3>
            <p className="text-sm text-indigo-200/90 leading-relaxed">
              {t.footer.levelsSummary}
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-300">
          <p>{t.footer.copyright}</p>
          <p>{t.company}</p>
        </div>
      </div>
    </footer>
  );
}
