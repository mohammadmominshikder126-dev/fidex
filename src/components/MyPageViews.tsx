import React, { useState } from 'react';
import {
  FileText,
  LayoutGrid,
  CreditCard,
  Building2,
  ChevronRight,
  LogOut,
  CheckCircle2,
  Sparkles,
  Globe,
  ShieldCheck,
  TrendingUp,
  Send,
  Headphones,
  ExternalLink,
} from 'lucide-react';
import type {
  AccountRecord,
  PaymentMethod,
  SiteConfig,
  UserProduct,
  UserProfile,
} from '../types';
import { FeedexLogoImage, SafeImage } from './QrMatrix';

export type MySubView =
  | 'overview'
  | 'records'
  | 'products'
  | 'bank'
  | 'company';

interface MyPageViewProps {
  user: UserProfile;
  siteConfig: SiteConfig;
  products: UserProduct[];
  records: AccountRecord[];
  subView: MySubView;
  onChangeSubView: (view: MySubView) => void;
  onClaimYield: (productId: string) => Promise<void>;
  onSaveBank: (input: {
    network: PaymentMethod;
    walletAddress: string;
    accountName: string;
    withdrawPassword?: string;
    newLoginPassword?: string;
  }) => Promise<void>;
  onNavigateRecharge: () => void;
  onNavigateWithdraw: () => void;
  onLogout: () => void;
}

export function MyPageView({
  user,
  siteConfig,
  products,
  records,
  subView,
  onChangeSubView,
  onClaimYield,
  onSaveBank,
  onNavigateRecharge,
  onNavigateWithdraw,
  onLogout,
}: MyPageViewProps) {
  if (subView === 'records') {
    return <AccountRecordsPanel records={records} onBack={() => onChangeSubView('overview')} />;
  }
  if (subView === 'products') {
    return (
      <MyProductsPanel
        products={products}
        onClaimYield={onClaimYield}
        onBack={() => onChangeSubView('overview')}
      />
    );
  }
  if (subView === 'bank') {
    return (
      <BankSecurityPanel
        user={user}
        onSave={onSaveBank}
        onBack={() => onChangeSubView('overview')}
      />
    );
  }
  if (subView === 'company') {
    return <CompanyProfilePanel onBack={() => onChangeSubView('overview')} />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 bg-white shrink-0">
                <SafeImage
                  src="/assets/aistudio/images__8__66bd7665.jpeg"
                  alt="পার্টনার প্রোফাইল"
                  className="w-full h-full object-cover"
                  fallbackTitle="FDX"
                />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 font-mono tracking-tight">
                  আইডি : {user.memberId}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  ফোন {user.phone} · কোড {user.inviteCode}
                </p>
              </div>
            </div>
            <FeedexLogoImage className="h-5 w-auto shrink-0" />
          </div>

          <div className="rounded-2xl bg-[#0448A2] text-white p-6 shadow-sm">
            <p className="text-sm font-medium text-white/90">ব্যালেন্স</p>
            <p className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight tabular-nums">
              ৳ {user.balance.toFixed(2)}
            </p>

            <div className="mt-6 flex items-center justify-between gap-4 text-xs sm:text-sm text-white/90 tabular-nums">
              <span>উত্তোলন : ৳ {user.totalWithdrawal.toFixed(2)}</span>
              <span>রিচার্জ : ৳ {user.totalRecharge.toFixed(2)}</span>
            </div>

            <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onNavigateRecharge}
                className="h-10 rounded-xl bg-white text-[#0448A2] text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                ডিপোজিট করুন
              </button>
              <button
                type="button"
                onClick={onNavigateWithdraw}
                className="h-10 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors"
              >
                উত্তোলন করুন
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-base font-bold text-slate-900 px-1">আমার সেবা</h2>

          <div className="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
            <ServiceRow
              icon={<FileText className="w-5 h-5 text-[#0448A2]" strokeWidth={1.8} />}
              label="অ্যাকাউন্ট রেকর্ডস"
              detail={`${records.length} টি তথ্য`}
              onClick={() => onChangeSubView('records')}
            />
            <ServiceRow
              icon={<LayoutGrid className="w-5 h-5 text-[#0448A2]" strokeWidth={1.8} />}
              label="আমার পণ্যসমূহ"
              detail={`${products.filter((p) => p.status === 'সক্রিয়').length} টি সক্রিয়`}
              onClick={() => onChangeSubView('products')}
            />
            <ServiceRow
              icon={<CreditCard className="w-5 h-5 text-[#0448A2]" strokeWidth={1.8} />}
              label="বিকাশ / নগদ / রকেট ও পাসওয়ার্ড"
              detail={user.bankBinding?.walletAddress ? user.bankBinding.network : 'যুক্ত নেই'}
              onClick={() => onChangeSubView('bank')}
            />
            <ServiceRow
              icon={<Building2 className="w-5 h-5 text-[#0448A2]" strokeWidth={1.8} />}
              label="কোম্পানি প্রোফাইল"
              detail="FeedexDigital"
              onClick={() => onChangeSubView('company')}
            />
            <a
              href={siteConfig.telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[60px] px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Send className="w-5 h-5 text-[#0448A2] shrink-0" strokeWidth={1.8} />
                <span className="text-sm font-medium text-slate-800 truncate">টেলিগ্রাম চ্যানেল ও গ্রুপ</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400">যোগ দিন</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </div>
            </a>
            <a
              href={siteConfig.supportLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[60px] px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Headphones className="w-5 h-5 text-[#0448A2] shrink-0" strokeWidth={1.8} />
                <span className="text-sm font-medium text-slate-800 truncate">সাপোর্ট সেন্টার</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400">সরাসরি সহায়তা</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </div>
            </a>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full h-12 rounded-2xl bg-white hover:bg-red-50 text-red-600 text-sm font-semibold shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceRow({
  icon,
  label,
  detail,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full min-h-[60px] px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <span className="shrink-0">{icon}</span>
        <span className="text-sm font-medium text-slate-800 truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-slate-400 tabular-nums">{detail}</span>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </button>
  );
}

function AccountRecordsPanel({
  records,
  onBack,
}: {
  records: AccountRecord[];
  onBack: () => void;
}) {
  const [filter, setFilter] = useState<'all' | AccountRecord['type']>('all');
  const visible =
    filter === 'all' ? records : records.filter((r) => r.type === filter);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FeedexLogoImage className="h-5 w-auto shrink-0" />
          <h2 className="text-lg font-bold text-slate-900">অ্যাকাউন্ট রেকর্ডস</h2>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-[#0448A2] hover:underline min-h-[40px] px-2"
        >
          ফিরে যান
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 bg-[#E2E6EC] p-1 rounded-xl">
        {(
          [
            ['all', 'সব'],
            ['recharge', 'ডিপোজিট'],
            ['withdrawal', 'উত্তোলন'],
            ['purchase', 'প্ল্যান'],
            ['income', 'আয়'],
            ['commission', 'রেফার'],
            ['bonus', 'বোনাস'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-[#0448A2] text-white'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
        {visible.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-400">এই বিভাগে কোনো লেনদেন নেই</div>
        ) : (
          visible.map((rec) => (
            <div key={rec.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{rec.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(rec.createdAt).toLocaleString('bn-BD')} · {rec.status}
                  {rec.reference ? ` · ${rec.reference}` : ''}
                </p>
              </div>
              <span
                className={`text-sm font-bold tabular-nums shrink-0 ${
                  rec.direction === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                }`}
              >
                {rec.direction === 'credit' ? '+' : '-'}৳ {rec.amount.toFixed(0)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MyProductsPanel({
  products,
  onClaimYield,
  onBack,
}: {
  products: UserProduct[];
  onClaimYield: (productId: string) => Promise<void>;
  onBack: () => void;
}) {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleClaim = async (productId: string) => {
    setClaimingId(productId);
    setMessage(null);
    try {
      await onClaimYield(productId);
      setMessage('দৈনিক আয় আপনার ওয়ালেট ব্যালেন্সে যোগ করা হয়েছে।');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'সংগ্রহ ব্যর্থ হয়েছে।');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FeedexLogoImage className="h-5 w-auto shrink-0" />
          <h2 className="text-lg font-bold text-slate-900">আমার পণ্যসমূহ</h2>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-[#0448A2] hover:underline min-h-[40px] px-2"
        >
          ফিরে যান
        </button>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-medium text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            আপনার কোনো সক্রিয় ভিআইপি বা কল্যাণ প্ল্যান নেই।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((prd) => {
            const pct = Math.min(100, Math.round((prd.claimedDays / prd.cycleDays) * 100));
            return (
              <div key={prd.id} className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#B91C1C]">{prd.planName}</h3>
                  <span className="text-xs font-semibold text-slate-500">
                    {prd.status} · দিন {prd.claimedDays}/{prd.cycleDays}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400">বিনিয়োগ</p>
                    <p className="font-semibold text-slate-900 tabular-nums mt-0.5">
                      ৳ {prd.price.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">দৈনিক আয়</p>
                    <p className="font-semibold text-[#0448A2] tabular-nums mt-0.5">
                      ৳ {prd.dailyIncome.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">মোট প্রাপ্ত</p>
                    <p className="font-semibold text-emerald-600 tabular-nums mt-0.5">
                      ৳ {prd.totalEarned.toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-[#0448A2] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <button
                  type="button"
                  disabled={prd.status === 'সম্পন্ন' || claimingId === prd.id}
                  onClick={() => handleClaim(prd.id)}
                  className="w-full h-10 rounded-xl bg-[#0448A2] hover:bg-[#033A85] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {prd.status === 'সম্পন্ন'
                      ? 'মেয়াদ সম্পন্ন'
                      : claimingId === prd.id
                        ? 'সংগ্রহ হচ্ছে...'
                        : `দৈনিক ৳ ${prd.dailyIncome.toFixed(0)} টাকা সংগ্রহ করুন`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BankSecurityPanel({
  user,
  onSave,
  onBack,
}: {
  user: UserProfile;
  onSave: (input: {
    network: PaymentMethod;
    walletAddress: string;
    accountName: string;
    withdrawPassword?: string;
    newLoginPassword?: string;
  }) => Promise<void>;
  onBack: () => void;
}) {
  const [network, setNetwork] = useState<PaymentMethod>(
    user.bankBinding?.network || 'বিকাশ'
  );
  const [walletAddress, setWalletAddress] = useState(user.bankBinding?.walletAddress || '');
  const [accountName, setAccountName] = useState(user.bankBinding?.accountName || '');
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [newLoginPassword, setNewLoginPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await onSave({
        network,
        walletAddress,
        accountName,
        withdrawPassword: withdrawPassword || undefined,
        newLoginPassword: newLoginPassword || undefined,
      });
      setSaved(true);
      setWithdrawPassword('');
      setNewLoginPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'তথ্য সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FeedexLogoImage className="h-5 w-auto shrink-0" />
          <h2 className="text-lg font-bold text-slate-900">বিকাশ / নগদ / রকেট ও পাসওয়ার্ড</h2>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-[#0448A2] hover:underline min-h-[40px] px-2"
        >
          ফিরে যান
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">
            পেমেন্ট মাধ্যম নির্বাচন করুন
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['বিকাশ', 'নগদ', 'রকেট'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setNetwork(item)}
                className={`h-10 rounded-xl text-xs font-semibold border transition-colors ${
                  network === item
                    ? 'bg-[#0448A2] text-white border-[#0448A2]'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="holder-name" className="block text-xs font-semibold text-slate-600 mb-1.5">
            অ্যাকাউন্ট হোল্ডারের নাম
          </label>
          <input
            id="holder-name"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="সম্পূর্ণ নাম লিখুন"
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0448A2]"
          />
        </div>

        <div>
          <label htmlFor="wallet-addr" className="block text-xs font-semibold text-slate-600 mb-1.5">
            {network} পার্সোনাল নম্বর
          </label>
          <input
            id="wallet-addr"
            type="tel"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder={`আপনার ${network} নম্বর লিখুন`}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-[#0448A2]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label htmlFor="wd-pass" className="block text-xs font-semibold text-slate-600 mb-1.5">
              {user.bankBinding?.hasWithdrawPassword
                ? 'নতুন উত্তোলন পাসওয়ার্ড (ঐচ্ছিক)'
                : 'উত্তোলন পাসওয়ার্ড সেট করুন'}
            </label>
            <input
              id="wd-pass"
              type="password"
              value={withdrawPassword}
              onChange={(e) => setWithdrawPassword(e.target.value)}
              placeholder="কমপক্ষে ৪ অক্ষর"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0448A2]"
            />
          </div>

          <div>
            <label htmlFor="login-pass" className="block text-xs font-semibold text-slate-600 mb-1.5">
              লগইন পাসওয়ার্ড পরিবর্তন (ঐচ্ছিক)
            </label>
            <input
              id="login-pass"
              type="password"
              value={newLoginPassword}
              onChange={(e) => setNewLoginPassword(e.target.value)}
              placeholder="পরিবর্তন না করলে ফাঁকা রাখুন"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0448A2]"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-medium text-red-700">
            {error}
          </div>
        )}
        {saved && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-medium text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>পেমেন্ট নম্বর ও নিরাপত্তা সেটিংস সংরক্ষিত হয়েছে।</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full h-11 rounded-xl bg-[#0448A2] hover:bg-[#033A85] disabled:opacity-60 text-white text-sm font-semibold"
        >
          {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
        </button>
      </form>
    </div>
  );
}

function CompanyProfilePanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FeedexLogoImage className="h-5 w-auto shrink-0" />
          <h2 className="text-lg font-bold text-slate-900">কোম্পানি প্রোফাইল</h2>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-[#0448A2] hover:underline min-h-[40px] px-2"
        >
          ফিরে যান
        </button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="h-44 relative">
          <SafeImage
            src="/assets/aistudio/images__9__13d6c096.jpeg"
            alt="FeedexDigital কোম্পানি প্রোফাইল"
            className="w-full h-full object-cover"
            fallbackTitle="FeedexDigital"
          />
          <div className="absolute inset-0 bg-slate-950/35 flex items-end p-5">
            <h3 className="text-xl font-bold text-white">FeedexDigital পার্টনার নেটওয়ার্ক</h3>
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>
            FeedexDigital এশিয়া-প্যাসিফিক, ইউরোপ ও উত্তর আমেরিকা জুড়ে ডিজিটাল কার্গো ফ্রেইট সেটেলমেন্ট, পার্টনার ট্রেজারি পুল এবং দ্রুত মোবাইল ফাইন্যান্সিয়াল লেনদেন পরিচালনা করে।
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <Globe className="w-5 h-5 text-[#0448A2] mb-2" />
              <p className="text-xs font-bold text-slate-900">বাংলা টাকায় লেনদেন</p>
              <p className="text-xs text-slate-500 mt-1">বিকাশ, নগদ ও রকেট সেন্ড মানি সাপোর্ট।</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <TrendingUp className="w-5 h-5 text-[#0448A2] mb-2" />
              <p className="text-xs font-bold text-slate-900">নির্ধারিত প্ল্যান</p>
              <p className="text-xs text-slate-500 mt-1">ভিআইপি ১–৬ দৈনিক আয় ও কল্যাণ প্ল্যান।</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <ShieldCheck className="w-5 h-5 text-[#0448A2] mb-2" />
              <p className="text-xs font-bold text-slate-900">৩-লেভেল কমিশন</p>
              <p className="text-xs text-slate-500 mt-1">রেফারেল টিম থেকে আকর্ষণীয় বোনাস।</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
