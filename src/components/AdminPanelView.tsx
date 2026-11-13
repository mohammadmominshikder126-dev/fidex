import React, { useEffect, useState } from 'react';
import {
  Ban,
  CheckCircle2,
  KeyRound,
  LogOut,
  MinusCircle,
  PlusCircle,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  Package,
  ArrowLeft,
} from 'lucide-react';
import {
  adjustAdminUserBalance,
  fetchAdminOverview,
  getAdminToken,
  loginAdminAccount,
  lookupAdminUser,
  resolveAdminDeposit,
  saveAdminConfig,
  saveAdminPlan,
  setAdminToken,
  toggleAdminUserBlock,
  updateAdminPassword,
} from '../lib/api';
import type {
  AdminOverviewPayload,
  AdminUserDetail,
  InvestmentPlan,
  SiteConfig,
} from '../types';
import { FeedexLogoImage } from './QrMatrix';

type AdminTab = 'members' | 'settings' | 'plans' | 'deposits' | 'security';

export function AdminPanelView({ onExitToSite }: { onExitToSite: () => void }) {
  const [overview, setOverview] = useState<AdminOverviewPayload | null>(null);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<AdminTab>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const [balanceOp, setBalanceOp] = useState<'add' | 'deduct'>('add');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceNote, setBalanceNote] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);

  const [configDraft, setConfigDraft] = useState<SiteConfig | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [planEdits, setPlanEdits] = useState<Record<string, InvestmentPlan>>({});
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [newAdminPass, setNewAdminPass] = useState('');

  useEffect(() => {
    let active = true;
    async function boot() {
      if (getAdminToken()) {
        try {
          const data = await fetchAdminOverview();
          if (active) {
            setOverview(data);
            setConfigDraft(data.config);
            setPlanEdits(Object.fromEntries(data.plans.map((p) => [p.id, { ...p }])));
          }
        } catch {
          setAdminToken(null);
        }
      }
      if (active) setChecking(false);
    }
    boot();
    return () => {
      active = false;
    };
  }, []);

  const syncOverview = (data: AdminOverviewPayload) => {
    setOverview(data);
    setConfigDraft(data.config);
    setPlanEdits(Object.fromEntries(data.plans.map((p) => [p.id, { ...p }])));
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const data = await loginAdminAccount(username, password);
      syncOverview(data);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'এডমিন লগইন ব্যর্থ হয়েছে।');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    setOverview(null);
    setSelectedUser(null);
    setUsername('');
    setPassword('');
  };

  const handleSearchMember = async (queryText: string) => {
    if (!queryText.trim()) return;
    setSearchError(null);
    setActionErr(null);
    setActionMsg(null);
    setSearching(true);
    try {
      const detail = await lookupAdminUser(queryText.trim());
      setSelectedUser(detail);
      setTab('members');
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'সদস্য খুঁজে পাওয়া যায়নি।');
    } finally {
      setSearching(false);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionErr(null);
    setActionMsg(null);
    const num = Number(balanceAmount);
    if (!Number.isFinite(num) || num <= 0) {
      setActionErr('সঠিক টাকার পরিমাণ লিখুন।');
      return;
    }
    try {
      const res = await adjustAdminUserBalance({
        userId: selectedUser.user.id,
        operation: balanceOp,
        amount: num,
        note: balanceNote.trim() || undefined,
      });
      setSelectedUser(res.detail);
      syncOverview(res.overview);
      setBalanceAmount('');
      setBalanceNote('');
      setActionMsg(
        balanceOp === 'add'
          ? `৳ ${num} টাকা সদস্যের ব্যালেন্সে যোগ করা হয়েছে।`
          : `৳ ${num} টাকা সদস্যের ব্যালেন্স থেকে কাটা হয়েছে।`
      );
    } catch (err) {
      setActionErr(err instanceof Error ? err.message : 'ব্যালেন্স পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  const handleToggleBlock = async () => {
    if (!selectedUser) return;
    setActionErr(null);
    try {
      const res = await toggleAdminUserBlock(selectedUser.user.id, !selectedUser.user.blocked);
      setSelectedUser(res.detail);
      syncOverview(res.overview);
      setActionMsg(res.detail.user.blocked ? 'সদস্য ব্লক করা হয়েছে।' : 'সদস্য আনব্লক করা হয়েছে।');
    } catch (err) {
      setActionErr(err instanceof Error ? err.message : 'অবস্থা পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configDraft) return;
    setSavingConfig(true);
    setActionMsg(null);
    setActionErr(null);
    try {
      const updated = await saveAdminConfig(configDraft);
      syncOverview(updated);
      setActionMsg('সাইট সেটিংস, রিচার্জ নাম্বার, টেলিগ্রাম ও রেফার কমিশন সংরক্ষিত হয়েছে।');
    } catch (err) {
      setActionErr(err instanceof Error ? err.message : 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSavePlan = async (planId: string) => {
    const draft = planEdits[planId];
    if (!draft) return;
    setSavingPlanId(planId);
    setActionMsg(null);
    setActionErr(null);
    try {
      const updated = await saveAdminPlan({
        planId,
        name: draft.name,
        price: Number(draft.price),
        dailyIncome: Number(draft.dailyIncome),
        cycleDays: Number(draft.cycleDays),
        totalReturn: Number(draft.totalReturn),
      });
      syncOverview(updated);
      setActionMsg(`${draft.name} আপডেট করা হয়েছে।`);
    } catch (err) {
      setActionErr(err instanceof Error ? err.message : 'প্ল্যান আপডেট ব্যর্থ হয়েছে।');
    } finally {
      setSavingPlanId(null);
    }
  };

  const handleResolveDeposit = async (recordId: string, action: 'approve' | 'reject') => {
    setActionMsg(null);
    setActionErr(null);
    try {
      const updated = await resolveAdminDeposit(recordId, action);
      syncOverview(updated);
      setActionMsg(action === 'approve' ? 'ডিপোজিট অনুমোদন করা হয়েছে।' : 'ডিপোজিট বাতিল করা হয়েছে।');
    } catch (err) {
      setActionErr(err instanceof Error ? err.message : 'ডিপোজিট আপডেট ব্যর্থ।');
    }
  };

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg(null);
    setActionErr(null);
    try {
      await updateAdminPassword(newAdminPass);
      setNewAdminPass('');
      setActionMsg('এডমিন পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।');
    } catch (err) {
      setActionErr(err instanceof Error ? err.message : 'পাসওয়ার্ড পরিবর্তন ব্যর্থ।');
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center text-sm text-slate-500">
        নিরাপত্তা যাচাই হচ্ছে...
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#0448A2] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">FeedexDigital এডমিন প্যানেল</h1>
                <p className="text-xs text-slate-500">শুধুমাত্র অনুমোদিত এডমিন প্রবেশ</p>
              </div>
            </div>
            <FeedexLogoImage className="h-5 w-auto shrink-0" />
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-user" className="block text-xs font-semibold text-slate-600 mb-1.5">
                এডমিন ইউজারনেম
              </label>
              <input
                id="admin-user"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="feedexadmin"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0448A2]"
              />
            </div>

            <div>
              <label htmlFor="admin-pass" className="block text-xs font-semibold text-slate-600 mb-1.5">
                এডমিন পাসওয়ার্ড
              </label>
              <input
                id="admin-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="এডমিন পাসওয়ার্ড দিন"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0448A2]"
              />
            </div>

            {loginError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-medium text-red-700">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full h-11 rounded-xl bg-[#0448A2] hover:bg-[#033A85] disabled:opacity-60 text-white text-sm font-semibold"
            >
              {loggingIn ? 'যাচাই হচ্ছে...' : 'এডমিন লগইন করুন'}
            </button>
          </form>

          <button
            type="button"
            onClick={onExitToSite}
            className="mt-5 w-full text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>মূল ওয়েবসাইটে ফিরে যান</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-white px-2 py-1 rounded-lg shrink-0">
              <FeedexLogoImage className="h-4 w-auto" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold leading-tight">
                FeedexDigital এডমিন কন্ট্রোল
              </h1>
              <p className="text-[11px] text-slate-300">সদস্য ও সিস্টেম পরিচালনা</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExitToSite}
              className="h-9 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold whitespace-nowrap"
            >
              সাইট দেখুন
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="h-9 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-500">মোট নিবন্ধিত সদস্য</p>
            <p className="mt-1.5 text-2xl font-bold text-[#0448A2] tabular-nums">
              {overview.totalUsers} জন
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-500">মোট ডিপোজিট</p>
            <p className="mt-1.5 text-2xl font-bold text-emerald-600 tabular-nums">
              ৳ {overview.totalDeposits.toFixed(0)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-500">মোট উত্তোলন</p>
            <p className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">
              ৳ {overview.totalWithdrawals.toFixed(0)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-500">অপেক্ষমাণ ডিপোজিট</p>
            <p className="mt-1.5 text-2xl font-bold text-amber-600 tabular-nums">
              {overview.pendingDeposits.length} টি
            </p>
          </div>
        </div>

        {/* Account Search Bar (Direct jump to user account) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchMember(searchQuery);
          }}
          className="bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 flex items-center gap-2.5 px-3.5 h-11 rounded-xl border border-slate-200 focus-within:border-[#0448A2]">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সদস্যের অ্যাকাউন্ট আইডি (যেমন: 041731786) অথবা মোবাইল নম্বর দিয়ে সার্চ করুন..."
              className="w-full text-sm focus:outline-none bg-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="h-11 px-5 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-sm font-semibold whitespace-nowrap"
          >
            {searching ? 'খোঁজা হচ্ছে...' : 'সদস্য খুঁজুন'}
          </button>
        </form>

        {searchError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-medium text-red-700">
            {searchError}
          </div>
        )}
        {actionMsg && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}
        {actionErr && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-medium text-red-700">
            {actionErr}
          </div>
        )}

        {/* Admin Section Tabs */}
        <div className="flex flex-wrap gap-2 bg-[#E2E6EC] p-1.5 rounded-xl">
          {(
            [
              ['members', 'সদস্য ও ফ্যামিলি কন্ট্রোল', Users],
              ['deposits', `ডিপোজিট অনুরোধ (${overview.pendingDeposits.length})`, Wallet],
              ['settings', 'রিচার্জ নাম্বার, টেলিগ্রাম ও কমিশন', Settings],
              ['plans', 'প্ল্যানের দাম ও আয়', Package],
              ['security', 'এডমিন পাসওয়ার্ড', KeyRound],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`h-10 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                tab === key
                  ? 'bg-[#0448A2] text-white'
                  : 'text-slate-700 hover:bg-white/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: MEMBERS & USER FAMILY CONTROL */}
        {tab === 'members' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Registered Users & Phone Numbers List */}
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  সকল নিবন্ধিত সদস্য ({overview.users.length} জন)
                </h2>
                <span className="text-xs text-slate-400">ক্লিক করে অ্যাকাউন্ট খুলুন</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[540px] overflow-y-auto">
                {overview.users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSearchMember(u.memberId)}
                    className={`w-full px-5 py-3.5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                      selectedUser?.user.id === u.id ? 'bg-[#0448A2]/5' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 font-mono">
                        {u.phone} · আইডি: {u.memberId}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        কোড: {u.inviteCode} · ডিপোজিট: ৳ {u.totalRecharge.toFixed(0)}
                        {u.blocked ? ' · ব্লকড' : ''}
                        {u.multiAccountFlag ? ' · একাধিক অ্যাকাউন্ট সনাক্ত' : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#0448A2] tabular-nums">
                        ৳ {u.balance.toFixed(0)}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Member Account & Family Control Panel */}
            <div className="lg:col-span-6 space-y-4">
              {!selectedUser ? (
                <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-500">
                    বাম পাশের তালিকা থেকে কোনো সদস্য নির্বাচন করুন অথবা অ্যাকাউন্ট নাম্বার দিয়ে সার্চ করুন।
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-mono">
                        আইডি: {selectedUser.user.memberId}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        মোবাইল: <span className="font-mono font-semibold text-slate-800">{selectedUser.user.phone}</span> · কোড: {selectedUser.user.inviteCode}
                      </p>
                      {selectedUser.user.multiAccountFlag && (
                        <p className="text-[11px] font-semibold text-amber-700 mt-1">
                          সতর্কতা: একই ডিভাইস থেকে একাধিক অ্যাকাউন্ট সনাক্ত হয়েছে
                        </p>
                      )}
                      {selectedUser.user.bankBinding?.walletAddress && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          পেমেন্ট: {selectedUser.user.bankBinding.network} ({selectedUser.user.bankBinding.walletAddress})
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleBlock}
                      className={`h-9 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                        selectedUser.user.blocked
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{selectedUser.user.blocked ? 'আনব্লক করুন' : 'ব্লক করুন'}</span>
                    </button>
                  </div>

                  {/* Balance & Stats */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-500">ব্যালেন্স</p>
                      <p className="text-base font-bold text-[#0448A2] tabular-nums mt-0.5">
                        ৳ {selectedUser.user.balance.toFixed(0)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-500">মোট ডিপোজিট</p>
                      <p className="text-base font-bold text-emerald-600 tabular-nums mt-0.5">
                        ৳ {selectedUser.user.totalRecharge.toFixed(0)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-500">মোট উত্তোলন</p>
                      <p className="text-base font-bold text-slate-900 tabular-nums mt-0.5">
                        ৳ {selectedUser.user.totalWithdrawal.toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {/* Add / Deduct Balance Form */}
                  <form onSubmit={handleAdjustBalance} className="rounded-xl bg-slate-50 p-4 space-y-3">
                    <p className="text-xs font-bold text-slate-800">
                      সদস্যের ব্যালেন্স যোগ অথবা কেটে নিন
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBalanceOp('add')}
                        className={`h-9 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 border ${
                          balanceOp === 'add'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>ব্যালেন্স যোগ (+)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBalanceOp('deduct')}
                        className={`h-9 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 border ${
                          balanceOp === 'deduct'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                        <span>ব্যালেন্স কাটুন (-)</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={balanceAmount}
                        onChange={(e) => setBalanceAmount(e.target.value)}
                        placeholder="টাকার পরিমাণ (৳)"
                        className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold tabular-nums"
                      />
                      <input
                        type="text"
                        value={balanceNote}
                        onChange={(e) => setBalanceNote(e.target.value)}
                        placeholder="কারণ/নোট (ঐচ্ছিক)"
                        className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-10 rounded-lg bg-[#0448A2] hover:bg-[#033A85] text-white text-xs font-semibold"
                    >
                      {balanceOp === 'add' ? 'ব্যালেন্স যোগ নিশ্চিত করুন' : 'ব্যালেন্স কর্তন নিশ্চিত করুন'}
                    </button>
                  </form>

                  {/* User Family Tree (Levels 1-3) */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-800">
                      ইউজার ফ্যামিলি ও রেফার টিম ({selectedUser.team.teamNumber} জন · টিম রিচার্জ ৳ {selectedUser.team.teamRecharge.toFixed(0)})
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <p className="text-slate-500">১ম লেভেল</p>
                        <p className="font-bold text-[#0448A2] mt-0.5">
                          {selectedUser.team.levels[1].length} জন
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <p className="text-slate-500">২য় লেভেল</p>
                        <p className="font-bold text-[#0448A2] mt-0.5">
                          {selectedUser.team.levels[2].length} জন
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <p className="text-slate-500">৩য় লেভেল</p>
                        <p className="font-bold text-[#0448A2] mt-0.5">
                          {selectedUser.team.levels[3].length} জন
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Records of Selected Member */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-800">সাম্প্রতিক লেনদেন</p>
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
                      {selectedUser.records.length === 0 ? (
                        <p className="p-4 text-xs text-slate-400 text-center">কোনো লেনদেন নেই</p>
                      ) : (
                        selectedUser.records.slice(0, 12).map((r) => (
                          <div key={r.id} className="px-3.5 py-2.5 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-slate-800">{r.title}</p>
                              <p className="text-[11px] text-slate-400">
                                {r.status} {r.reference ? `· ${r.reference}` : ''}
                              </p>
                            </div>
                            <span
                              className={`font-bold tabular-nums ${
                                r.direction === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                              }`}
                            >
                              {r.direction === 'credit' ? '+' : '-'}৳ {r.amount.toFixed(0)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PENDING DEPOSITS */}
        {tab === 'deposits' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">অপেক্ষমাণ ডিপোজিট অনুরোধ</h2>
            </div>
            {overview.pendingDeposits.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-400">
                বর্তমানে কোনো অপেক্ষমাণ ডিপোজিট অনুরোধ নেই। (সব ডিপোজিট ম্যানুয়ালি এডমিন অনুমোদনের পর যুক্ত হবে)
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {overview.pendingDeposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="px-5 py-4 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {dep.userPhone} (আইডি: {dep.memberId}) · {dep.method}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        TXID: {dep.reference} · ৳ {dep.amount.toFixed(0)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResolveDeposit(dep.id, 'approve')}
                        className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        অনুমোদন করুন
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveDeposit(dep.id, 'reject')}
                        className="h-9 px-3.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                      >
                        বাতিল করুন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SITE SETTINGS (RECHARGE NUMBERS, TELEGRAM, SUPPORT, REFERRAL COMMISSIONS) */}
        {tab === 'settings' && configDraft && (
          <form onSubmit={handleSaveConfig} className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3">
                রিচার্জ (সেন্ড মানি) নাম্বার পরিবর্তন
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    বিকাশ সেন্ড মানি নম্বর
                  </label>
                  <input
                    type="text"
                    value={configDraft.rechargeNumbers.বিকাশ}
                    onChange={(e) =>
                      setConfigDraft({
                        ...configDraft,
                        rechargeNumbers: {
                          ...configDraft.rechargeNumbers,
                          বিকাশ: e.target.value,
                        },
                      })
                    }
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    নগদ সেন্ড মানি নম্বর
                  </label>
                  <input
                    type="text"
                    value={configDraft.rechargeNumbers.নগদ}
                    onChange={(e) =>
                      setConfigDraft({
                        ...configDraft,
                        rechargeNumbers: {
                          ...configDraft.rechargeNumbers,
                          নগদ: e.target.value,
                        },
                      })
                    }
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    রকেট সেন্ড মানি নম্বর
                  </label>
                  <input
                    type="text"
                    value={configDraft.rechargeNumbers.রকেট}
                    onChange={(e) =>
                      setConfigDraft({
                        ...configDraft,
                        rechargeNumbers: {
                          ...configDraft.rechargeNumbers,
                          রকেট: e.target.value,
                        },
                      })
                    }
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-base font-bold text-slate-900 mb-3">
                টেলিগ্রাম গ্রুপ ও সাপোর্ট সেন্টার লিংক
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    টেলিগ্রাম গ্রুপ / চ্যানেল লিংক
                  </label>
                  <input
                    type="url"
                    value={configDraft.telegramLink}
                    onChange={(e) =>
                      setConfigDraft({ ...configDraft, telegramLink: e.target.value })
                    }
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    সাপোর্ট সেন্টার লিংক
                  </label>
                  <input
                    type="url"
                    value={configDraft.supportLink}
                    onChange={(e) =>
                      setConfigDraft({ ...configDraft, supportLink: e.target.value })
                    }
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-base font-bold text-slate-900 mb-3">
                রেফার কমিশন (%) ও বোনাস নিয়ন্ত্রণ
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    ১ম লেভেল (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={configDraft.referralRates.level1}
                    onChange={(e) =>
                      setConfigDraft({
                        ...configDraft,
                        referralRates: {
                          ...configDraft.referralRates,
                          level1: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-semibold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    ২য় লেভেল (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={configDraft.referralRates.level2}
                    onChange={(e) =>
                      setConfigDraft({
                        ...configDraft,
                        referralRates: {
                          ...configDraft.referralRates,
                          level2: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-semibold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    ৩য় লেভেল (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={configDraft.referralRates.level3}
                    onChange={(e) =>
                      setConfigDraft({
                        ...configDraft,
                        referralRates: {
                          ...configDraft.referralRates,
                          level3: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-semibold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    নিবন্ধন বোনাস (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={configDraft.registrationBonus}
                    onChange={(e) =>
                      setConfigDraft({
                        ...configDraft,
                        registrationBonus: Number(e.target.value),
                      })
                    }
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-semibold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    সর্বনিম্ন ডিপোজিট (৳)
                  </label>
                  <input
                    type="number"
                    min="50"
                    value={configDraft.minDeposit}
                    onChange={(e) =>
                      setConfigDraft({
                        ...configDraft,
                        minDeposit: Number(e.target.value),
                      })
                    }
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-semibold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    সর্বনিম্ন উত্তোলন (৳)
                  </label>
                  <input
                    type="number"
                    min="50"
                    value={configDraft.minWithdraw}
                    onChange={(e) =>
                      setConfigDraft({
                        ...configDraft,
                        minWithdraw: Number(e.target.value),
                      })
                    }
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm font-semibold tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  ম্যানুয়াল ডিপোজিট অনুমোদন সক্রিয়
                </p>
                <p className="text-xs text-slate-500">
                  এডমিন প্যানেল থেকে অ্যাপ্রুভ না করা পর্যন্ত কোনো ডিপোজিট অ্যাকাউন্টে যোগ হবে না এবং একই ট্রানজেকশন আইডি ২ বার দেওয়া যাবে না
                </p>
              </div>
              <span className="h-9 px-4 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 inline-flex items-center shrink-0">
                সক্রিয়
              </span>
            </div>

            <button
              type="submit"
              disabled={savingConfig}
              className="h-11 px-6 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-sm font-semibold inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? 'সংরক্ষণ হচ্ছে...' : 'সব সেটিংস সংরক্ষণ করুন'}</span>
            </button>
          </form>
        )}

        {/* TAB 4: PLAN PRICES & RETURNS */}
        {tab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview.plans.map((plan) => {
              const draft = planEdits[plan.id] || plan;
              return (
                <div key={plan.id} className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0448A2]">{plan.code}</span>
                    <span className="text-xs text-slate-400">
                      {plan.category === 'daily' ? 'দৈনিক আয়' : 'কল্যাণ প্ল্যান'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">প্ল্যানের নাম</label>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(e) =>
                        setPlanEdits({
                          ...planEdits,
                          [plan.id]: { ...draft, name: e.target.value },
                        })
                      }
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">মূল্য (৳)</label>
                      <input
                        type="number"
                        value={draft.price}
                        onChange={(e) =>
                          setPlanEdits({
                            ...planEdits,
                            [plan.id]: { ...draft, price: Number(e.target.value) },
                          })
                        }
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-semibold tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">দৈনিক আয় (৳)</label>
                      <input
                        type="number"
                        value={draft.dailyIncome}
                        onChange={(e) => {
                          const daily = Number(e.target.value);
                          setPlanEdits({
                            ...planEdits,
                            [plan.id]: {
                              ...draft,
                              dailyIncome: daily,
                              totalReturn: daily * draft.cycleDays,
                            },
                          });
                        }}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-semibold tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">মেয়াদ (দিন)</label>
                      <input
                        type="number"
                        value={draft.cycleDays}
                        onChange={(e) => {
                          const days = Number(e.target.value);
                          setPlanEdits({
                            ...planEdits,
                            [plan.id]: {
                              ...draft,
                              cycleDays: days,
                              totalReturn: draft.dailyIncome * days,
                            },
                          });
                        }}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-semibold tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">মোট রিটার্ন (৳)</label>
                      <input
                        type="number"
                        value={draft.totalReturn}
                        onChange={(e) =>
                          setPlanEdits({
                            ...planEdits,
                            [plan.id]: { ...draft, totalReturn: Number(e.target.value) },
                          })
                        }
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-semibold tabular-nums"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={savingPlanId === plan.id}
                    onClick={() => handleSavePlan(plan.id)}
                    className="w-full h-10 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-xs font-semibold"
                  >
                    {savingPlanId === plan.id ? 'সংরক্ষণ হচ্ছে...' : 'প্ল্যান সংরক্ষণ করুন'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 5: ADMIN SECURITY */}
        {tab === 'security' && (
          <form onSubmit={handleChangeAdminPassword} className="max-w-md bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">এডমিন পাসওয়ার্ড পরিবর্তন</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                নতুন এডমিন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
              </label>
              <input
                type="password"
                value={newAdminPass}
                onChange={(e) => setNewAdminPass(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড লিখুন"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-5 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-sm font-semibold"
            >
              পাসওয়ার্ড আপডেট করুন
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
