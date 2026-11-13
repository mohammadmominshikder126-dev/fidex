import React, { useEffect, useState } from 'react';
import {
  Lock,
  Smartphone,
  Ticket,
  Eye,
  EyeOff,
  Send,
  Headphones,
  ExternalLink,
} from 'lucide-react';
import type { SiteConfig } from '../types';
import { FeedexLogoImage, SafeImage } from './QrMatrix';

interface AuthViewProps {
  siteConfig: SiteConfig;
  initialMode?: 'login' | 'register';
  initialInviteCode?: string;
  onLogin: (phone: string, password: string) => Promise<void>;
  onRegister: (phone: string, password: string, inviteCode?: string) => Promise<void>;
  onBack?: () => void;
}

export function AuthView({
  siteConfig,
  initialMode = 'login',
  initialInviteCode = '',
  onLogin,
  onRegister,
  onBack,
}: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (initialInviteCode) {
      setInviteCode(initialInviteCode);
      setMode('register');
    }
  }, [initialInviteCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone.trim() || !password) {
      setError('অনুগ্রহ করে মোবাইল নম্বর এবং লগইন পাসওয়ার্ড দিন।');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('দুটি পাসওয়ার্ড একরকম নয়।');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(phone.trim(), password);
      } else {
        await onRegister(phone.trim(), password, inviteCode.trim() || undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'প্রবেশ সম্পন্ন করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8">
      <div className="bg-white sm:rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-6 relative min-h-[210px] sm:min-h-[260px] lg:min-h-[520px] overflow-hidden">
          <SafeImage
            src="/assets/aistudio/e4cf2de03ad051bc28ff33864f809d51_cd43a73c.jpg"
            alt="FeedexDigital এয়ারলাইন ব্যানার"
            className="w-full h-full object-cover"
            fallbackTitle="FeedexDigital"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-transparent to-slate-950/75" />
          <div className="absolute inset-x-0 top-6 flex items-center justify-center px-4">
            <div className="bg-white/95 backdrop-blur-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-2.5">
              <FeedexLogoImage className="h-6 w-auto" />
              <span className="text-sm font-bold text-[#4D148C]">ডিজিটাল</span>
            </div>
          </div>
          <div className="hidden lg:flex absolute inset-x-6 bottom-6 flex-col gap-1.5 text-white">
            <p className="text-sm font-bold">FeedexDigital পার্টনার প্ল্যাটফর্ম</p>
            <p className="text-xs text-white/90 leading-relaxed">
              নতুন নিবন্ধনেই পাচ্ছেন ৳ {siteConfig.registrationBonus} টাকা বোনাস। বিকাশ, নগদ ও রকেট দিয়ে সহজ ডিপোজিট ও উত্তোলন।
            </p>
          </div>
        </div>

        <div className="lg:col-span-6 px-5 py-6 sm:p-8 flex flex-col justify-center">
          <div className="grid grid-cols-2 rounded-xl overflow-hidden bg-[#F1F3F6] p-1 mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`relative min-h-[44px] text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                mode === 'login'
                  ? 'bg-[#0448A2] text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              লগইন
              {mode === 'login' && (
                <span className="block w-5 h-0.5 bg-white mx-auto mt-1 rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`relative min-h-[44px] text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                mode === 'register'
                  ? 'bg-[#0448A2] text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              নিবন্ধন
              {mode === 'register' && (
                <span className="block w-5 h-0.5 bg-white mx-auto mt-1 rounded-full" />
              )}
            </button>
          </div>

          {mode === 'register' && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-semibold text-emerald-800">
              নতুন অ্যাকাউন্ট নিবন্ধন করলেই পাচ্ছেন ৳ {siteConfig.registrationBonus} টাকা ওয়েলকাম বোনাস!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="sr-only">মোবাইল নম্বর</span>
              <div className="flex items-center gap-3 px-4 h-12 rounded-xl border border-slate-200 bg-white focus-within:border-[#0448A2] focus-within:ring-2 focus-within:ring-[#0448A2]/15 transition-all">
                <Smartphone className="w-5 h-5 text-[#DC2626] shrink-0" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="মোবাইল নম্বর দিন"
                  autoComplete="tel"
                  className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>
            </label>

            <label className="block">
              <span className="sr-only">লগইন পাসওয়ার্ড</span>
              <div className="flex items-center gap-3 px-4 h-12 rounded-xl border border-slate-200 bg-white focus-within:border-[#0448A2] focus-within:ring-2 focus-within:ring-[#0448A2]/15 transition-all">
                <Lock className="w-5 h-5 text-[#DC2626] shrink-0" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="লগইন পাসওয়ার্ড দিন"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPass ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>

            {mode === 'register' && (
              <>
                <label className="block">
                  <span className="sr-only">পাসওয়ার্ড নিশ্চিত করুন</span>
                  <div className="flex items-center gap-3 px-4 h-12 rounded-xl border border-slate-200 bg-white focus-within:border-[#0448A2] focus-within:ring-2 focus-within:ring-[#0448A2]/15 transition-all">
                    <Lock className="w-5 h-5 text-[#0448A2] shrink-0" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                      autoComplete="new-password"
                      className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="sr-only">রেফার কোড</span>
                  <div className="flex items-center gap-3 px-4 h-12 rounded-xl border border-slate-200 bg-white focus-within:border-[#0448A2] focus-within:ring-2 focus-within:ring-[#0448A2]/15 transition-all">
                    <Ticket className="w-5 h-5 text-[#0448A2] shrink-0" />
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="রেফার কোড (ঐচ্ছিক, যেমন: FDX731786)"
                      className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent uppercase font-mono"
                    />
                  </div>
                </label>
              </>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-[#0448A2] hover:bg-[#033A85] disabled:opacity-60 text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading
                ? 'অপেক্ষা করুন...'
                : mode === 'login'
                  ? 'লগইন করুন'
                  : 'নিবন্ধন সম্পন্ন করুন'}
            </button>
          </form>

          {/* Dynamic Telegram & Support Center Links */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
            <p className="text-xs font-semibold text-slate-700">
              অফিসিয়াল টেলিগ্রাম ও সাপোর্ট সেন্টার
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={siteConfig.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-3 rounded-xl bg-[#0448A2]/8 hover:bg-[#0448A2]/15 text-[#0448A2] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span>টেলিগ্রাম গ্রুপ</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-75" />
              </a>
              <a
                href={siteConfig.supportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Headphones className="w-3.5 h-3.5 shrink-0 text-[#0448A2]" />
                <span>সাপোর্ট সেন্টার</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-75" />
              </a>
            </div>
          </div>

          {onBack && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 min-h-[40px]"
              >
                হোম পেজে ফিরুন
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
