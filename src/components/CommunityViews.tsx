import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Headphones,
  Send,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import type { SiteConfig } from '../types';
import { FeedexLogoImage, QrMatrix } from './QrMatrix';

export function InviteView({
  inviteCode,
  siteConfig,
  isAuthenticated,
  onRequireAuth,
}: {
  inviteCode: string;
  siteConfig: SiteConfig;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const codeToUse = isAuthenticated ? inviteCode : 'FDX731786';
  const shareUrl = `${window.location.origin}/?ref=${codeToUse}`;

  const copyText = async (text: string, kind: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      if (kind === 'link') {
        setCopiedLink(true);
        window.setTimeout(() => setCopiedLink(false), 1800);
      } else {
        setCopiedCode(true);
        window.setTimeout(() => setCopiedCode(false), 1800);
      }
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="flex justify-center mb-3">
            <FeedexLogoImage className="h-6 w-auto" />
          </div>
          <p className="text-sm font-bold text-slate-900">পার্টনার রেফার QR কোড শেয়ার করুন</p>
          <p className="text-xs text-slate-500 mt-1">
            বন্ধুদের আমন্ত্রণ জানান এবং ৩-লেভেল রেফার কমিশন উপার্জন করুন
          </p>

          <div className="mt-5 flex justify-center">
            <QrMatrix value={shareUrl} size={172} />
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between gap-3">
            <div className="text-left">
              <p className="text-[11px] text-slate-500">আপনার রেফার কোড</p>
              <p className="text-base font-bold text-[#0448A2] font-mono">{codeToUse}</p>
            </div>
            <button
              type="button"
              onClick={() => copyText(codeToUse, 'code')}
              className="h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'কপি হয়েছে' : 'কোড কপি'}</span>
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              aria-label="রেফারেল লিংক"
              className="flex-1 h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-600"
            />
            <button
              type="button"
              onClick={() => copyText(shareUrl, 'link')}
              className="h-11 px-4 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-xs font-semibold whitespace-nowrap"
            >
              {copiedLink ? 'কপি হয়েছে' : 'লিংক কপি'}
            </button>
          </div>

          {!isAuthenticated && (
            <button
              type="button"
              onClick={onRequireAuth}
              className="mt-4 text-xs font-semibold text-[#0448A2] hover:underline"
            >
              নিজস্ব রেফার কোড পেতে লগইন করুন
            </button>
          )}
        </div>

        <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">রেফার কমিশনের ধাপ</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            আপনার রেফারে যুক্ত কোনো সদস্য ডিপোজিট করলে অথবা কোনো ভিআইপি/কল্যাণ প্ল্যান কিনলে স্বয়ংক্রিয়ভাবে কমিশন ব্যালেন্সে যোগ হবে।
          </p>

          <div className="divide-y divide-slate-100">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">১ম লেভেল · সরাসরি সদস্য</p>
                <p className="text-xs text-slate-500">আপনার কোডে নিবন্ধিত</p>
              </div>
              <span className="text-lg font-bold text-[#0448A2] tabular-nums">
                {siteConfig.referralRates.level1}%
              </span>
            </div>
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">২য় লেভেল · দ্বিতীয় স্তর</p>
                <p className="text-xs text-slate-500">১ম লেভেলের রেফারে যুক্ত</p>
              </div>
              <span className="text-lg font-bold text-[#0448A2] tabular-nums">
                {siteConfig.referralRates.level2}%
              </span>
            </div>
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">৩য় লেভেল · তৃতীয় স্তর</p>
                <p className="text-xs text-slate-500">২য় লেভেলের রেফারে যুক্ত</p>
              </div>
              <span className="text-lg font-bold text-[#0448A2] tabular-nums">
                {siteConfig.referralRates.level3}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DownloadView() {
  const [downloadedPlatform, setDownloadedPlatform] = useState<'android' | 'ios' | null>(null);

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0448A2] text-white flex items-center justify-center shrink-0">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <FeedexLogoImage className="h-5 w-auto mb-1.5" />
            <h2 className="text-lg font-bold text-slate-900">FeedexDigital মোবাইল অ্যাপ</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              দ্রুত দৈনিক আয় সংগ্রহ, ডিপোজিট এবং টিম মনিটরিংয়ের জন্য অ্যাপ ইনস্টল করুন
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4 flex flex-col justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900">অ্যান্ড্রয়েড প্যাকেজ</p>
              <p className="text-xs text-slate-500 mt-1">
                Android ৯.০+ · অফিশিয়াল ওয়েব অ্যাপ (১৪.২ মেগাবাইট)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDownloadedPlatform('android')}
              className="w-full h-11 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-xs font-semibold inline-flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>অ্যান্ড্রয়েড APK ডাউনলোড</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 flex flex-col justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900">আইওএস হোম স্ক্রিন</p>
              <p className="text-xs text-slate-500 mt-1">
                iOS ১৫+ · সাফারি শর্টকাট প্রোফাইল
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDownloadedPlatform('ios')}
              className="w-full h-11 rounded-xl border border-[#0448A2] text-[#0448A2] hover:bg-[#0448A2]/5 text-xs font-semibold inline-flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>iOS প্রোফাইল ইনস্টল</span>
            </button>
          </div>
        </div>

        {downloadedPlatform && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-700 leading-relaxed">
            {downloadedPlatform === 'android'
              ? 'অ্যান্ড্রয়েড Chrome ব্রাউজারের মেনু (⋮) থেকে "Install app" বা "Add to Home screen" নির্বাচন করলে FeedexDigital অ্যাপ হিসেবে যুক্ত হয়ে যাবে।'
              : 'আইফোন Safari ব্রাউজারের Share বাটনে ট্যাপ করে "Add to Home Screen" নির্বাচন করলে সহজেই অ্যাপ আইকন তৈরি হবে।'}
          </div>
        )}
      </div>
    </div>
  );
}

export function SpinWheelModal({
  isAuthenticated,
  lastSpinDate,
  onSpin,
  onRequireAuth,
  onClose,
}: {
  isAuthenticated: boolean;
  lastSpinDate: string | null;
  onSpin: () => Promise<number>;
  onRequireAuth: () => void;
  onClose: () => void;
}) {
  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const today = new Date().toISOString().slice(0, 10);
  const alreadyClaimed = isAuthenticated && lastSpinDate === today;

  const handleSpinClick = async () => {
    if (!isAuthenticated) {
      onClose();
      onRequireAuth();
      return;
    }
    setError(null);
    setSpinning(true);
    setRotation((prev) => prev + 1080 + Math.floor(Math.random() * 240));
    try {
      const won = await onSpin();
      window.setTimeout(() => {
        setReward(won);
        setSpinning(false);
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'স্পিন সম্পন্ন করা যায়নি।');
      setSpinning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl text-center">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900">দৈনিক লাকি হুইল</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-5 flex justify-center">
          <div
            className="w-44 h-44 rounded-full border-4 border-amber-400 shadow-inner flex items-center justify-center transition-transform duration-1000 ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 120 120" className="w-full h-full">
              <circle cx="60" cy="60" r="58" fill="#FEF3C7" />
              <path d="M60 60 L60 2 A58 58 0 0 1 110 31 Z" fill="#F59E0B" />
              <path d="M60 60 L110 89 A58 58 0 0 1 60 118 Z" fill="#F59E0B" />
              <path d="M60 60 L10 89 A58 58 0 0 1 10 31 Z" fill="#F59E0B" />
              <circle cx="60" cy="60" r="14" fill="#0448A2" stroke="#FFFFFF" strokeWidth="3" />
            </svg>
          </div>
        </div>

        {reward !== null && (
          <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-sm font-bold text-emerald-700">
            অভিনন্দন! আপনি ৳ {reward.toFixed(0)} টাকা বোনাস পেয়েছেন।
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs font-medium text-amber-800">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={spinning || (alreadyClaimed && reward === null)}
          onClick={handleSpinClick}
          className="w-full h-11 rounded-xl bg-[#0448A2] hover:bg-[#033A85] disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {spinning
              ? 'ঘুরছে...'
              : alreadyClaimed
                ? 'আজকের বোনাস নেওয়া হয়েছে'
                : isAuthenticated
                  ? 'স্পিন করে বোনাস নিন'
                  : 'স্পিন করতে লগইন করুন'}
          </span>
        </button>
      </div>
    </div>
  );
}

export function InfoDrawerModal({
  kind,
  siteConfig,
  onClose,
}: {
  kind: 'channel' | 'support';
  siteConfig: SiteConfig;
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-[#0448A2] text-white flex items-center justify-center">
              {kind === 'channel' ? (
                <Send className="w-4 h-4" />
              ) : (
                <Headphones className="w-4 h-4" />
              )}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {kind === 'channel' ? 'অফিসিয়াল টেলিগ্রাম গ্রুপ' : 'অনলাইন সাপোর্ট সেন্টার'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {kind === 'channel' ? (
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 p-3.5">
              <p className="text-xs font-bold text-[#0448A2]">ঘোষণা · বিকাশ, নগদ ও রকেট পেমেন্ট</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                সেন্ড মানি ডিপোজিট ২৪ ঘণ্টা সচল রয়েছে এবং নতুন নিবন্ধনে ৳ {siteConfig.registrationBonus} টাকা বোনাস দেওয়া হচ্ছে।
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <p className="text-xs font-bold text-[#0448A2]">ঘোষণা · ৩-লেভেল রেফারেল</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                প্রতিটি ডিপোজিট ও প্ল্যান ক্রয়ে {siteConfig.referralRates.level1}% / {siteConfig.referralRates.level2}% / {siteConfig.referralRates.level3}% তিন স্তরের রেফারেল কমিশন স্বয়ংক্রিয়ভাবে যুক্ত হয়।
              </p>
            </div>
            <a
              href={siteConfig.telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>টেলিগ্রাম গ্রুপে যোগ দিন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              ডিপোজিট, উত্তোলন বা প্ল্যান সংক্রান্ত যেকোনো সহায়তার জন্য সরাসরি টেলিগ্রাম সাপোর্টে যোগাযোগ করুন অথবা বার্তা পাঠান।
            </p>
            <a
              href={siteConfig.supportLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 rounded-xl bg-[#4D148C] hover:bg-[#3B0E6D] text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>টেলিগ্রাম সাপোর্ট সেন্টার খুলুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="আপনার সমস্যা বা সদস্য আইডি লিখুন..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0448A2]"
            />
            {sent ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-medium text-emerald-700">
                আপনার বার্তাটি সাপোর্ট ডেস্কে পাঠানো হয়েছে। শীঘ্রই উত্তর দেওয়া হবে।
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (message.trim()) setSent(true);
                }}
                className="w-full h-11 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-sm font-semibold"
              >
                বার্তা পাঠান
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function WelcomeLinksModal({
  title,
  siteConfig,
  onClose,
}: {
  title: string;
  siteConfig: SiteConfig;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          সর্বশেষ আপডেট, পেমেন্ট নোটিশ এবং তাৎক্ষণিক সহায়তার জন্য আমাদের অফিসিয়াল টেলিগ্রাম গ্রুপ ও সাপোর্ট সেন্টারে যুক্ত থাকুন।
        </p>

        <div className="space-y-2.5">
          <a
            href={siteConfig.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>অফিসিয়াল টেলিগ্রাম গ্রুপ</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={siteConfig.supportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 rounded-xl bg-[#4D148C] hover:bg-[#3B0E6D] text-white text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Headphones className="w-4 h-4" />
            <span>লাইভ সাপোর্ট সেন্টার</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-10 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            চালিয়ে যান
          </button>
        </div>
      </div>
    </div>
  );
}
