import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Bot,
  Send,
  Trash2,
  User,
} from 'lucide-react';
import { STUDENT_LEVELS } from '../constants/aiConfig.ts';
import { LEVEL_LABELS, TRANSLATIONS } from '../i18n/translations.ts';
import { sendChatMessage } from '../services/geminiClient.ts';
import type { AppSettings, ChatMessage, StudentLevel } from '../types/index.ts';
import { MarkdownRenderer } from './MarkdownRenderer.tsx';

interface ChatTutorViewProps {
  settings: AppSettings;
  preselectedLevel?: StudentLevel;
}

export function ChatTutorView({ settings, preselectedLevel }: ChatTutorViewProps) {
  const t = TRANSLATIONS[settings.language];
  const levelLabels = LEVEL_LABELS[settings.language];

  const [level, setLevel] = useState<StudentLevel>(preselectedLevel || settings.defaultLevel);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: t.chat.welcomeMsg,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Update initial welcome message when language toggles and conversation hasn't started
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ ...prev[0], text: TRANSLATIONS[settings.language].chat.welcomeMsg }];
      }
      return prev;
    });
  }, [settings.language]);

  useEffect(() => {
    if (preselectedLevel) {
      setLevel(preselectedLevel);
    }
  }, [preselectedLevel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) {
      setValidationError(t.chat.emptyInputError);
      return;
    }
    if (loading) return;

    setValidationError(null);
    setError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      // Exclude synthetic welcome greeting so history begins with user turn
      const historyForApi = nextMessages
        .filter((m) => m.id !== 'welcome')
        .map(({ role, text }) => ({ role, text }));

      const data = await sendChatMessage({
        messages: historyForApi,
        level,
        settings,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: t.chat.welcomeMsg,
        timestamp: Date.now(),
      },
    ]);
    setError(null);
    setValidationError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full flex-1 flex flex-col">
      {/* Page Title & Controls */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1E1B4B]">
            {t.chat.title}
          </h1>
          <p className="text-slate-600 mt-1 text-sm">{t.chat.subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <label htmlFor="chat-level" className="text-xs font-semibold text-slate-600">
              {t.chat.levelPrefix}
            </label>
            <select
              id="chat-level"
              value={level}
              onChange={(e) => setLevel(e.target.value as StudentLevel)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
            >
              {STUDENT_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {levelLabels[lvl]}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleClearChat}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.chat.clearBtn}</span>
          </button>
        </div>
      </div>

      {/* Messenger Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[520px] max-h-[72vh] overflow-hidden">
        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F8FAFC]">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div
                    className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4338CA] to-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-sm"
                    aria-hidden="true"
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                    isUser
                      ? 'bg-[#4338CA] text-white rounded-br-sm shadow-sm'
                      : 'bg-white text-[#1E1B4B] border border-violet-200/90 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  ) : (
                    <MarkdownRenderer content={msg.text} compact />
                  )}
                </div>

                {isUser && (
                  <div
                    className="w-8 h-8 rounded-xl bg-indigo-100 text-[#4338CA] flex items-center justify-center shrink-0"
                    aria-hidden="true"
                  >
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Animated Typing Indicator */}
          {loading && (
            <div className="flex items-end gap-3 justify-start">
              <div
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4338CA] to-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-sm"
                aria-hidden="true"
              >
                <Bot className="w-4 h-4" />
              </div>
              <div
                className="bg-white border border-violet-200/90 rounded-2xl rounded-bl-sm px-4 py-3.5 shadow-sm flex items-center gap-1.5"
                aria-label="Tutor is typing"
              >
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] typing-dot-1" />
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] typing-dot-2" />
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] typing-dot-3" />
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs sm:text-sm text-red-700 flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips + Input Composer */}
        <div className="bg-white border-t border-slate-200 p-4 space-y-3">
          {/* Quick Chips */}
          <div>
            <p className="text-[11px] font-medium text-slate-500 mb-2">
              {t.chat.quickChipsLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {t.chat.quickChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={loading}
                  onClick={() => void sendMessage(chip)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4338CA] border border-indigo-200/70 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleFormSubmit} noValidate className="flex items-end gap-2.5">
            <div className="flex-1">
              <textarea
                rows={2}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder={t.chat.inputPlaceholder}
                aria-label={t.chat.inputPlaceholder}
                className={`w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm text-[#1E1B4B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4338CA] ${
                  validationError ? 'border-red-500 bg-red-50/40' : 'border-slate-300 bg-white'
                }`}
              />
              {validationError && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {validationError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#4338CA] to-[#7C3AED] hover:from-[#3730A3] hover:to-[#6D28D9] disabled:opacity-60 text-white font-semibold text-sm transition-all shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t.chat.sendBtn}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
