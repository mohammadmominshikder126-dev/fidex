import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ShieldAlert, X, AlertCircle } from 'lucide-react';
import type { BankBinding, PaymentMethod, SiteConfig } from '../types';
import { FeedexLogoImage } from './QrMatrix';

const QUICK_AMOUNTS = [300, 500, 1000, 2000, 5000, 10000];

const METHOD_META: Record<PaymentMethod, { color: string; short: string }> = {
  বিকাশ: { color: '#E2136E', short: 'bK' },
  নগদ: { color: '#F7941D', short: 'Ng' },
  রকেট: { color: '#8C3494', short: 'Rk' },
};

interface RechargeViewProps {
  balance: number;
  siteConfig: SiteConfig;
  onRecharge: (amount: number, method: PaymentMethod, txid: string) => Promise<void>;
}

export function RechargeView({ balance, siteConfig, onRecharge }: RechargeViewProps) {
  const [amountInput, setAmountInput] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('বিকাশ');
  const [showCheckout, setShowCheckout] = useState(false);
  const [txid, setTxid] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const parsedAmount = Number(amountInput);
  const minDeposit = siteConfig.minDeposit || 300;
  const activeNumber = siteConfig.rechargeNumbers[method];

  const handleOpenCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCheckoutError(null);
    setSuccessMsg(null);
    if (!Number.isFinite(parsedAmount) || parsedAmount < minDeposit) {
      setError(`সর্বনিম্ন ডিপোজিট (রিচার্জ) পরিমাণ ৳ ${minDeposit} টাকা।`);
      return;
    }
    setShowCheckout(true);
  };

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(activeNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleConfirmDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    if (!txid.trim() || txid.trim().length < 4) {
      setCheckoutError('অনুগ্রহ করে সেন্ড মানি করার পর সঠিক ট্রানজেকশন আইডি (Transaction ID) দিন।');
      return;
    }
    setSubmitting(true);
    try {
      const normalizedTxid = txid.trim().replace(/\s+/g, '').toUpperCase();
      await onRecharge(parsedAmount, method, normalizedTxid);
      setSuccessMsg(
        `${method} ৳ ${parsedAmount.toFixed(0)} টাকার ডিপোজিট অনুরোধ (TXID: ${normalizedTxid}) সাবমিট হয়েছে। এডমিন প্যানেল থেকে অ্যাপ্রুভ করার পর আপনার অ্যাকাউন্টে ব্যালেন্স যুক্ত হবে।`
      );
      setAmountInput('');
      setTxid('');
      setShowCheckout(false);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'ডিপোজিট সম্পন্ন হয়নি।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm text-center">
          <FeedexLogoImage className="h-6 w-auto mx-auto mb-3" />
          <p className="text-3xl font-bold text-[#0448A2] tabular-nums">
            ৳ {balance.toFixed(2)}
          </p>
          <p className="mt-1.5 text-sm font-medium text-slate-500">বর্তমান ব্যালেন্স (টাকা)</p>
          <div className="mt-5 pt-4 border-t border-slate-100 text-left space-y-2 text-xs text-slate-500">
            <p>সর্বনিম্ন ডিপোজিট: ৳ {minDeposit} টাকা</p>
            <p>মাধ্যম: বিকাশ · নগদ · রকেট (সেন্ড মানি)</p>
            <p>এডমিন অ্যাপ্রুভ করার পর ব্যালেন্স অ্যাকাউন্টে যুক্ত হবে</p>
          </div>
        </div>

        <form
          onSubmit={handleOpenCheckout}
          className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 shadow-sm space-y-6"
        >
          <div>
            <label
              htmlFor="recharge-amount"
              className="block text-sm font-bold text-slate-900 mb-2.5"
            >
              ডিপোজিটের পরিমাণ লিখুন (টাকা)
            </label>
            <input
              id="recharge-amount"
              type="number"
              min={minDeposit}
              step="1"
              value={amountInput}
              onChange={(e) => {
                setAmountInput(e.target.value);
                setError(null);
              }}
              placeholder={`সর্বনিম্ন ৳ ${minDeposit} টাকা`}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 text-center text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0448A2] focus:ring-2 focus:ring-[#0448A2]/15 tabular-nums"
            />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900 mb-2.5">দ্রুত পরিমাণ নির্বাচন</p>
            <div className="grid grid-cols-3 gap-2.5">
              {QUICK_AMOUNTS.map((amt) => {
                const selected = Number(amountInput) === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmountInput(String(amt));
                      setError(null);
                    }}
                    className={`min-h-[52px] px-2 py-2 rounded-xl text-sm font-semibold tabular-nums transition-all border ${
                      selected
                        ? 'bg-[#0448A2] text-white border-[#0448A2]'
                        : 'bg-[#F5F7FA] text-slate-800 border-transparent hover:border-slate-300'
                    }`}
                  >
                    ৳ {amt}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900 mb-2.5">
              পেমেন্ট মাধ্যম নির্বাচন করুন (শুধুমাত্র সেন্ড মানি)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(['বিকাশ', 'নগদ', 'রকেট'] as const).map((item) => {
                const meta = METHOD_META[item];
                const active = method === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMethod(item)}
                    className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-center gap-2 min-h-[96px] transition-all ${
                      active
                        ? 'border-[#0448A2] bg-[#0448A2]/5 ring-2 ring-[#0448A2]/15'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: meta.color }}
                    >
                      {meta.short}
                    </span>
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {item}
                    </span>
                    <span className="text-[11px] text-slate-500">সেন্ড মানি</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-medium text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-sm font-semibold transition-colors"
          >
            সেন্ড মানি ও ডিপোজিট করুন
          </button>
        </form>
      </div>

      {/* Send Money Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleConfirmDeposit}
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {method} সেন্ড মানি নির্দেশনা
              </h3>
              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-4 rounded-xl bg-slate-50 p-3.5">
              <p className="text-xs text-slate-500">মোট সেন্ড মানি পরিমাণ</p>
              <p className="text-2xl font-bold text-[#0448A2] tabular-nums mt-0.5">
                ৳ {parsedAmount.toFixed(0)} টাকা
              </p>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-600 mb-1.5">
                নিচের {method} পার্সোনাল নম্বরে সেন্ড মানি করুন:
              </p>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between gap-2">
                <span className="text-base font-mono font-bold text-slate-900">
                  {activeNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="shrink-0 h-8 px-3 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'কপি হয়েছে' : 'নম্বর কপি'}</span>
                </button>
              </div>
            </div>

            <label className="block mb-4">
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                ট্রানজেকশন আইডি (Transaction ID) দিন *
              </span>
              <input
                type="text"
                required
                value={txid}
                onChange={(e) => setTxid(e.target.value)}
                placeholder="যেমন: 9K8A7B6C5D"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:outline-none focus:border-[#0448A2]"
              />
            </label>

            {checkoutError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-red-700">
                {checkoutError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-[#0448A2] hover:bg-[#033A85] disabled:opacity-60 text-white text-sm font-semibold"
            >
              {submitting ? 'সাবমিট হচ্ছে...' : 'ডিপোজিট সাবমিট করুন'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

interface WithdrawViewProps {
  balance: number;
  totalRecharge: number;
  minWithdraw: number;
  bankBinding: BankBinding | null;
  onWithdraw: (amount: number, withdrawPassword: string) => Promise<void>;
  onGoBindBank: () => void;
  onGoRecharge: () => void;
}

export function WithdrawView({
  balance,
  totalRecharge,
  minWithdraw,
  bankBinding,
  onWithdraw,
  onGoBindBank,
  onGoRecharge,
}: WithdrawViewProps) {
  const [amount, setAmount] = useState('');
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasWallet = Boolean(bankBinding && bankBinding.walletAddress);
  const hasDeposited = totalRecharge > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!hasDeposited) {
      setError('উত্তোলন করার আগে কমপক্ষে একবার ডিপোজিট (রিচার্জ) সম্পন্ন করতে হবে।');
      return;
    }
    const num = Number(amount);
    if (!Number.isFinite(num) || num < minWithdraw) {
      setError(`সর্বনিম্ন উত্তোলন পরিমাণ ৳ ${minWithdraw} টাকা।`);
      return;
    }
    if (!withdrawPassword) {
      setError('অনুগ্রহ করে উত্তোলন পাসওয়ার্ড দিন।');
      return;
    }
    setSubmitting(true);
    try {
      await onWithdraw(num, withdrawPassword);
      setSuccess(`৳ ${num.toFixed(0)} টাকা উত্তোলন সফলভাবে সম্পন্ন হয়েছে।`);
      setAmount('');
      setWithdrawPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'উত্তোলন ব্যর্থ হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-5 rounded-2xl bg-[#0448A2] text-white p-6 shadow-sm">
          <div className="inline-flex items-center bg-white px-2.5 py-1 rounded-lg mb-3">
            <FeedexLogoImage className="h-4 w-auto" />
          </div>
          <p className="text-sm text-white/85">উত্তোলনযোগ্য ব্যালেন্স</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">৳ {balance.toFixed(2)}</p>
          <div className="mt-5 pt-4 border-t border-white/20 text-xs text-white/85 space-y-1.5">
            <p>সর্বনিম্ন উত্তোলন: ৳ {minWithdraw} টাকা</p>
            <p>উত্তোলন মাধ্যম: বিকাশ · নগদ · রকেট</p>
            <p>শর্ত: কমপক্ষে ১টি ডিপোজিট সম্পন্ন থাকতে হবে</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-sm space-y-5"
        >
          {!hasDeposited && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">
                  ডিপোজিট ছাড়া উত্তোলন বন্ধ রয়েছে
                </p>
                <p className="text-xs text-red-700 mt-0.5">
                  উত্তোলন চালু করতে অনুগ্রহ করে প্রথমে বিকাশ, নগদ বা রকেট দিয়ে ডিপোজিট সম্পন্ন করুন।
                </p>
                <button
                  type="button"
                  onClick={onGoRecharge}
                  className="mt-3 h-9 px-3.5 rounded-lg bg-[#0448A2] text-white text-xs font-semibold"
                >
                  ডিপোজিট পেজে যান
                </button>
              </div>
            </div>
          )}

          {!hasWallet ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  বিকাশ / নগদ / রকেট নম্বর যুক্ত করা হয়নি
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  প্রথমে আপনার বিকাশ, নগদ বা রকেট নম্বর এবং উত্তোলন পাসওয়ার্ড সেট করুন।
                </p>
                <button
                  type="button"
                  onClick={onGoBindBank}
                  className="mt-3 h-9 px-3.5 rounded-lg bg-[#0448A2] text-white text-xs font-semibold"
                >
                  নম্বর ও পাসওয়ার্ড যুক্ত করুন
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  {bankBinding?.network} · {bankBinding?.accountName}
                </p>
                <p className="text-xs font-mono font-semibold text-slate-800 truncate mt-0.5">
                  {bankBinding?.walletAddress}
                </p>
              </div>
              <button
                type="button"
                onClick={onGoBindBank}
                className="text-xs font-semibold text-[#0448A2] hover:underline shrink-0"
              >
                পরিবর্তন
              </button>
            </div>
          )}

          <div>
            <label htmlFor="withdraw-amount" className="block text-sm font-bold text-slate-900 mb-2">
              উত্তোলনের পরিমাণ (টাকা)
            </label>
            <div className="flex gap-2">
              <input
                id="withdraw-amount"
                type="number"
                min={minWithdraw}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`সর্বনিম্ন ৳ ${minWithdraw} টাকা`}
                className="flex-1 h-12 px-4 rounded-xl border border-slate-200 text-base font-semibold text-slate-900 focus:outline-none focus:border-[#0448A2] tabular-nums"
              />
              <button
                type="button"
                onClick={() => setAmount(String(balance))}
                className="px-4 h-12 rounded-xl border border-slate-200 text-xs font-semibold text-[#0448A2] hover:bg-slate-50 whitespace-nowrap"
              >
                সর্বোচ্চ
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="withdraw-pass" className="block text-sm font-bold text-slate-900 mb-2">
              উত্তোলন পাসওয়ার্ড
            </label>
            <input
              id="withdraw-pass"
              type="password"
              value={withdrawPassword}
              onChange={(e) => setWithdrawPassword(e.target.value)}
              placeholder="উত্তোলন পাসওয়ার্ড দিন"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#0448A2]"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-medium text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !hasWallet || !hasDeposited}
            className="w-full h-12 rounded-xl bg-[#0448A2] hover:bg-[#033A85] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {submitting ? 'প্রক্রিয়াকরণ হচ্ছে...' : 'উত্তোলন নিশ্চিত করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}
