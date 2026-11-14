import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ChatTutorView } from './components/ChatTutorView.tsx';
import { Footer } from './components/Footer.tsx';
import { HomeView } from './components/HomeView.tsx';
import { Navbar } from './components/Navbar.tsx';
import { QuizView } from './components/QuizView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { StudyHubView } from './components/StudyHubView.tsx';
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
} from './constants/aiConfig.ts';
import type { AppSettings, NavPage, StudentLevel } from './types/index.ts';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      language: parsed.language === 'en' ? 'en' : 'bn',
      modelOption: parsed.modelOption === 'fast' ? 'fast' : 'quality',
      temperature:
        typeof parsed.temperature === 'number' &&
        parsed.temperature >= 0.2 &&
        parsed.temperature <= 0.9
          ? parsed.temperature
          : DEFAULT_SETTINGS.temperature,
      defaultLevel: parsed.defaultLevel || DEFAULT_SETTINGS.defaultLevel,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [activePage, setActivePage] = useState<NavPage>('home');
  const [preselectedLevel, setPreselectedLevel] = useState<StudentLevel | undefined>(
    undefined
  );
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.lang = settings.language;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage quota issues cleanly
    }
  }, [settings]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((current) => (current === msg ? null : current));
    }, 2800);
  };

  const handleNavigate = (page: NavPage, level?: StudentLevel) => {
    if (level) {
      setPreselectedLevel(level);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLanguage = () => {
    setSettings((prev) => ({
      ...prev,
      language: prev.language === 'bn' ? 'en' : 'bn',
    }));
  };

  const handleSaveSettings = (next: AppSettings) => {
    setSettings(next);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1E1B4B]">
      <Navbar
        activePage={activePage}
        onNavigate={(page) => handleNavigate(page)}
        language={settings.language}
        onToggleLanguage={handleToggleLanguage}
      />

      <main className="flex-1 flex flex-col">
        {activePage === 'home' && (
          <HomeView language={settings.language} onNavigate={handleNavigate} />
        )}
        {activePage === 'study' && (
          <StudyHubView
            settings={settings}
            preselectedLevel={preselectedLevel}
            onShowToast={showToast}
          />
        )}
        {activePage === 'quiz' && (
          <QuizView settings={settings} preselectedLevel={preselectedLevel} />
        )}
        {activePage === 'chat' && (
          <ChatTutorView settings={settings} preselectedLevel={preselectedLevel} />
        )}
        {activePage === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onShowToast={showToast}
          />
        )}
      </main>

      <Footer
        language={settings.language}
        onNavigate={(page) => handleNavigate(page)}
      />

      {/* Accessible Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#1E1B4B] text-white text-sm font-medium shadow-xl border border-white/15"
        >
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" aria-hidden="true" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
