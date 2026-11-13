import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Wallet,
  Send,
  Headphones,
  CheckCircle2,
  X,
  Sparkles,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import type { InvestmentPlan, PlanCategory, SiteConfig } from '../types';
import { FeedexLogoImage, SafeImage } from './QrMatrix';

interface HomeViewProps {
  plans: InvestmentPlan[];
  siteConfig: SiteConfig;
  isAuthenticated: boolean;
  userBalance: number;
  totalRecharge: number;
  lastSpinDate: string | null;
  onNavigateRecharge: () => void;
  onNavigateWithdrawal: () => void;
  onOpenChannel: () => void;
  onOpenSupport: () => void;
  onOpenSpin: () => void;
  onBuyPlan: (plan: InvestmentPlan) => Promise<void>;
  onRequireAuth: () => void;
}

const HERO_SLIDES = [
  {
    src: '/assets/aistudio/images__9__13d6c096.jpeg',
    alt: 'FeedexDigital প্রধান পার্টনার ব্যানার',
    title: 'FeedexDigital পার্টনার নেটওয়ার্ক',
    subtitle: 'নতুন নিবন্ধনেই ১৫০ টাকা বোনাস এবং দৈনিক আয়ের ভিআইপি প্ল্যান',
  },
  {
    src: '/assets/aistudio/80825423_605f44ca.jpg',
    alt: 'FeedexDigital এক্সপ্রেস ফ্লিট ব্যানার',
    title: 'বিশ্বব্যাপী কার্গো ও ডিজিটাল সম্পদ পরিচালনা',
    subtitle: 'বিকাশ, নগদ ও রকেট সেন্ড মানির মাধ্যমে দ্রুত ডিপোজিট ও উত্তোলন',
  },
  {
    src: '/assets/aistudio/images__26__5ccb2af9.jpeg',
    alt: 'FeedexDigital এয়ার কার্গো অপারেশন',
    title: 'ডিপোজিট করে আজই সক্রিয় করুন আপনার প্ল্যান',
    subtitle: '৩-লেভেল রেফারেল কমিশন ও তাৎক্ষণিক দৈনিক আয় সংগ্রহ সুবিধা',
  },
];

const LIVE_PAYMENTS = [
  { id: '04182***91', method: 'বিকাশ', amount: 1250, time: 'এইমাত্র' },
  { id: '04194***23', method: 'নগদ', amount: 650, time: '১ মিনিট আগে' },
  { id: '04177***48', method: 'রকেট', amount: 2400, time: '২ মিনিট আগে' },
  { id: '04203***17', method: 'বিকাশ', amount: 880, time: '৩ মিনিট আগে' },
  { id: '04165***84', method: 'নগদ', amount: 3500, time: '৪ মিনিট আগে' },
  { id: '04190***52', method: 'বিকাশ', amount: 520, time: '৫ মিনিট আগে' },
  { id: '04211***09', method: 'রকেট', amount: 1750, time: '৬ মিনিট আগে' },
  { id: '04158***63', method: 'নগদ', amount: 960, time: '৭ মিনিট আগে' },
];

export function HomeView({
  plans,
  siteConfig,
  isAuthenticated,
  userBalance,
  totalRecharge,
  lastSpinDate,
  onNavigateRecharge,
  onNavigateWithdrawal,
  onOpenChannel,
  onOpenSupport,
  onOpenSpin,
  onBuyPlan,
  onRequireAuth,
}: HomeViewProps) {
  const [activeTab, setActiveTab] = useState<PlanCategory>('daily');
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [buying, setBuying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, []);

  const filteredPlans = plans.filter((p) => p.category === activeTab);
  const today = new Date().toISOString().slice(0, 10);
  const spinAvailable = !isAuthenticated || lastSpinDate !== today;
  const hasDeposited = totalRecharge > 0;
  const activeSlide = HERO_SLIDES[slideIndex];

  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return;
    setBuying(true);
    setFeedback(null);
    try {
      await onBuyPlan(selectedPlan);
      setFeedback({
        type: 'success',
        text: `${selectedPlan.name} সফলভাবে ক্রয় করা হয়েছে। "আমার পণ্যসমূহ" থেকে দৈনিক আয় সংগ্রহ করুন।`,
      });
      setSelectedPlan(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'প্ল্যান কেনা সম্পন্ন হয়নি।',
      });
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-6">
      {/* Hero Banner Carousel */}
      <div className="relative overflow-hidden sm:rounded-2xl sm:mt-5 bg-[#4D148C]">
        <div className="relative h-48 sm:h-64 lg:h-72 w-full">
          <SafeImage
            src={activeSlide.src}
            alt={activeSlide.alt}
            className="w-full h-full object-cover"
            fallbackTitle="FeedexDigital"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-slate-950/20" />

          <div className="absolute inset-x-4 sm:inset-x-8 bottom-7 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/95 px-2.5 py-1 rounded-lg mb-2">
                <FeedexLogoImage className="h-4 w-auto" />
                <span className="text-[11px] font-bold text-[#4D148C]">ডিজিটাল পার্টনার</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-balance">
                {activeSlide.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 mt-0.5">
                {activeSlide.subtitle}
              </p>
            </div>
          </div>

          <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSlideIndex(idx)}
                aria-label={`ব্যানার স্লাইড ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  slideIndex === idx ? 'w-5 bg-[#FF6600] ring-1 ring-white/80' : 'w-2 bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4 Quick Action Buttons */}
      <div className="bg-white sm:rounded-2xl sm:mt-4 px-2 py-3.5 shadow-sm grid grid-cols-4 gap-1">
        <button
          type="button"
          onClick={onNavigateRecharge}
          className="flex flex-col items-center justify-center gap-1.5 min-h-[56px] rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all"
        >
          <CreditCard className="w-6 h-6 text-[#0448A2]" strokeWidth={1.8} />
          <span className="text-xs font-medium text-slate-700 whitespace-nowrap">ডিপোজিট</span>
        </button>
        <button
          type="button"
          onClick={onNavigateWithdrawal}
          className="flex flex-col items-center justify-center gap-1.5 min-h-[56px] rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all"
        >
          <Wallet className="w-6 h-6 text-[#0448A2]" strokeWidth={1.8} />
          <span className="text-xs font-medium text-slate-700 whitespace-nowrap">উত্তোলন</span>
        </button>
        <button
          type="button"
          onClick={onOpenChannel}
          className="flex flex-col items-center justify-center gap-1.5 min-h-[56px] rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all"
        >
          <span className="w-7 h-7 rounded-full bg-[#0448A2] text-white flex items-center justify-center">
            <Send className="w-3.5 h-3.5 -ml-0.5" />
          </span>
          <span className="text-xs font-medium text-slate-700 whitespace-nowrap">টেলিগ্রাম</span>
        </button>
        <button
          type="button"
          onClick={onOpenSupport}
          className="flex flex-col items-center justify-center gap-1.5 min-h-[56px] rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all"
        >
          <span className="w-7 h-7 rounded-full bg-[#0448A2] text-white flex items-center justify-center">
            <Headphones className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-medium text-slate-700 whitespace-nowrap">সাপোর্ট</span>
        </button>
      </div>

      {/* Entry Community & Support Link Strip */}
      <div className="mx-3 sm:mx-0 mt-3 bg-white rounded-xl px-4 py-2.5 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-600 font-medium">
          অফিসিয়াল আপডেট ও সহায়তার জন্য যুক্ত থাকুন · নতুন নিবন্ধনে ৳ {siteConfig.registrationBonus} বোনাস
        </span>
        <div className="flex items-center gap-4">
          <a
            href={siteConfig.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#0448A2] hover:underline whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            <span>টেলিগ্রাম গ্রুপ</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={siteConfig.supportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#4D148C] hover:underline whitespace-nowrap"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>সাপোর্ট সেন্টার</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Telegram Bonus Banner */}
      <div className="mx-3 sm:mx-0 mt-3 rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-sky-950">
          <Send className="w-4 h-4 text-[#0448A2] shrink-0" />
          <span>টেলিগ্রামে যুক্ত হন এবং ৫০টাকা বোনাস পান</span>
        </div>
        <a
          href={siteConfig.telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 px-3.5 rounded-lg bg-[#0448A2] hover:bg-[#033A85] text-white text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>টেলিগ্রামে যুক্ত হন</span>
        </a>
      </div>

      {/* Feedback Notification */}
      {feedback && (
        <div
          className={`mx-3 sm:mx-0 mt-4 rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 opacity-70 hover:opacity-100"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Slanted Segmented Tabs: দৈনিক আয় | কল্যাণ প্ল্যান */}
      <div className="px-3 sm:px-0 mt-4">
        <div className="bg-[#E2E6EC] rounded-lg overflow-hidden grid grid-cols-2 max-w-xl">
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`h-11 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-[#0448A2] text-white tab-slant-left'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            দৈনিক আয়
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('welfare')}
            className={`h-11 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'welfare'
                ? 'bg-[#0448A2] text-white tab-slant-right'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            কল্যাণ প্ল্যান
          </button>
        </div>
      </div>

      {/* VIP & Welfare Plan Grid in Taka (৳) */}
      <div className="px-3 sm:px-0 mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map((plan) => (
          <article
            key={plan.id}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <h3 className="text-base font-bold text-[#B91C1C] tracking-tight mb-3">
                {plan.name}
              </h3>

              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <SafeImage
                    src={plan.imagePath}
                    alt={plan.name}
                    className="w-full h-full object-cover"
                    fallbackTitle={plan.code}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[11px] font-bold text-white tracking-tight">
                      {plan.code}
                    </span>
                  </div>
                </div>

                <dl className="flex-1 space-y-1.5 text-[13px]">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">মূল্য:</dt>
                    <dd className="font-semibold text-[#0448A2] tabular-nums">
                      ৳ {plan.price.toFixed(0)} টাকা
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">দৈনিক আয়:</dt>
                    <dd className="font-semibold text-[#0448A2] tabular-nums">
                      ৳ {plan.dailyIncome.toFixed(0)} টাকা
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">মেয়াদ:</dt>
                    <dd className="font-semibold text-[#0448A2] tabular-nums">
                      {plan.cycleDays} দিন
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">মোট রিটার্ন:</dt>
                    <dd className="font-semibold text-[#0448A2] tabular-nums">
                      ৳ {plan.totalReturn.toFixed(0)} টাকা
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  onRequireAuth();
                  return;
                }
                setSelectedPlan(plan);
              }}
              className="mt-4 w-full h-11 rounded-xl bg-[#0448A2] hover:bg-[#033A85] active:scale-[0.99] text-white text-sm font-semibold transition-all whitespace-nowrap"
            >
              এখনই কিনুন
            </button>
          </article>
        ))}
      </div>

      {/* Live Moving Payments Feed at the Bottom of Home Page */}
      <section aria-label="লাইভ পেমেন্ট তালিকা" className="px-3 sm:px-0 mt-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0448A2]" />
              <h3 className="text-sm font-bold text-slate-900">লাইভ পেমেন্ট</h3>
            </div>
            <span className="text-xs text-slate-500">বিকাশ · নগদ · রকেট</span>
          </div>

          <div className="h-52 overflow-hidden relative">
            <div className="animate-live-payouts">
              {[...LIVE_PAYMENTS, ...LIVE_PAYMENTS].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="px-5 py-3 border-b border-slate-50 flex items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 font-mono truncate">
                      সদস্য {item.id}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {item.method} · {item.time}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-emerald-600 tabular-nums">
                      +৳ {item.amount.toLocaleString('en-US')} টাকা
                    </p>
                    <p className="text-[11px] text-slate-500">সফল পেমেন্ট</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Lucky Spin Button */}
      <button
        type="button"
        onClick={onOpenSpin}
        aria-label="দৈনিক লাকি হুইল খুলুন"
        className="fixed right-4 bottom-20 md:bottom-6 z-30 w-13 h-13 rounded-full bg-white shadow-lg border border-amber-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <svg viewBox="0 0 48 48" className="w-11 h-11" aria-hidden="true">
          <circle cx="24" cy="24" r="21" fill="#F59E0B" />
          <path d="M24 3 L24 24 L42 13 Z" fill="#FBBF24" />
          <path d="M24 24 L42 35 L24 45 Z" fill="#FBBF24" />
          <path d="M24 24 L6 35 L6 13 Z" fill="#FBBF24" />
          <circle cx="24" cy="24" r="20" fill="none" stroke="#FDE68A" strokeWidth="2.5" />
          <circle cx="24" cy="24" r="5" fill="#FFFFFF" stroke="#D97706" strokeWidth="2" />
        </svg>
        {spinAvailable && <span className="sr-only">দৈনিক স্পিন পাওয়া যাচ্ছে</span>}
      </button>

      {/* Purchase Confirmation Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">প্ল্যান ক্রয় নিশ্চিত করুন</h3>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">নির্বাচিত প্ল্যান</span>
                <span className="font-bold text-[#B91C1C]">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">প্ল্যান মূল্য</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  ৳ {selectedPlan.price.toFixed(0)} টাকা
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">দৈনিক আয়</span>
                <span className="font-semibold text-[#0448A2] tabular-nums">
                  ৳ {selectedPlan.dailyIncome.toFixed(0)} টাকা / দিন
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">মোট রিটার্ন ({selectedPlan.cycleDays} দিন)</span>
                <span className="font-semibold text-emerald-700 tabular-nums">
                  ৳ {selectedPlan.totalReturn.toFixed(0)} টাকা
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between">
                <span className="text-slate-500">বর্তমান ব্যালেন্স</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ৳ {userBalance.toFixed(0)} টাকা
                </span>
              </div>
            </div>

            {!hasDeposited ? (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-medium text-red-600">
                  ডিপোজিট না করে কোনো প্ল্যান কেনা যাবে না। অনুগ্রহ করে প্রথমে বিকাশ, নগদ বা রকেট দিয়ে ডিপোজিট করুন।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(null);
                    onNavigateRecharge();
                  }}
                  className="w-full h-11 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-sm font-semibold"
                >
                  ডিপোজিট পেজে যান
                </button>
              </div>
            ) : userBalance < selectedPlan.price ? (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-medium text-red-600">
                  এই প্ল্যানের জন্য আপনার ব্যালেন্স ৳ {(selectedPlan.price - userBalance).toFixed(0)} টাকা কম রয়েছে।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(null);
                    onNavigateRecharge();
                  }}
                  className="w-full h-11 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-sm font-semibold"
                >
                  ব্যালেন্স রিচার্জ করুন
                </button>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={buying}
                  onClick={handleConfirmPurchase}
                  className="h-11 rounded-xl bg-[#0448A2] hover:bg-[#033A85] disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{buying ? 'সক্রিয় হচ্ছে...' : 'ক্রয় নিশ্চিত করুন'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
