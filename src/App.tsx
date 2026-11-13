/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  Download,
  Home,
  Share2,
  User,
  Users,
} from 'lucide-react';
import { AdminPanelView } from './components/AdminPanelView';
import { AuthView } from './components/AuthView';
import {
  DownloadView,
  InfoDrawerModal,
  InviteView,
  SpinWheelModal,
  WelcomeLinksModal,
} from './components/CommunityViews';
import { HomeView } from './components/HomeView';
import { MyPageView, type MySubView } from './components/MyPageViews';
import { FeedexLogoImage } from './components/QrMatrix';
import { TeamView } from './components/TeamView';
import { RechargeView, WithdrawView } from './components/WalletViews';
import {
  buyPlan,
  claimDailyYield,
  fetchDashboard,
  fetchPlansAndConfig,
  getStoredToken,
  loginAccount,
  registerAccount,
  saveBankAndSecurity,
  setStoredToken,
  spinWheel,
  submitRecharge,
  submitWithdrawal,
} from './lib/api';
import { DEFAULT_PLANS, DEFAULT_SITE_CONFIG } from './lib/localFallback';
import type {
  DashboardPayload,
  InvestmentPlan,
  PaymentMethod,
  SiteConfig,
} from './types';

type RouteView =
  | 'home'
  | 'team'
  | 'invite'
  | 'download'
  | 'my'
  | 'recharge'
  | 'withdraw'
  | 'auth';

const EMPTY_TEAM = {
  teamRecharge: 0,
  teamAssets: 0,
  teamNumber: 0,
  levels: { 1: [], 2: [], 3: [] },
};

const PAGE_TITLES: Record<RouteView, string> = {
  home: 'হোম',
  team: 'টিম',
  invite: 'আমন্ত্রণ',
  download: 'ডাউনলোড',
  my: 'আমার পেজ',
  recharge: 'ডিপোজিট',
  withdraw: 'উত্তোলন',
  auth: 'লগইন / নিবন্ধন',
};

function checkIsAdminPath(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  return (
    path === '/admin' ||
    path.endsWith('/admin') ||
    hash === '#/admin' ||
    hash === '#admin' ||
    params.get('admin') === '1' ||
    params.get('admin') === 'true' ||
    params.get('page') === 'admin'
  );
}

function extractReferralCode(): string {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const fromSearch = searchParams.get('ref') || searchParams.get('invite');
    if (fromSearch) return fromSearch.trim();
    const hashQueryIndex = window.location.hash.indexOf('?');
    if (hashQueryIndex !== -1) {
      const hashParams = new URLSearchParams(window.location.hash.slice(hashQueryIndex));
      return (hashParams.get('ref') || hashParams.get('invite') || '').trim();
    }
    return '';
  } catch {
    return '';
  }
}

export default function App() {
  const initialRef = useMemo(() => extractReferralCode(), []);

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(checkIsAdminPath);
  const [view, setView] = useState<RouteView>(initialRef ? 'auth' : 'home');
  const [previousView, setPreviousView] = useState<RouteView>('home');
  const [mySubView, setMySubView] = useState<MySubView>('overview');
  const [plans, setPlans] = useState<InvestmentPlan[]>(DEFAULT_PLANS);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [booting, setBooting] = useState(true);
  const [spinOpen, setSpinOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<'channel' | 'support' | null>(null);
  const [welcomeTitle, setWelcomeTitle] = useState<string | null>(null);

  const refreshPublicConfig = useCallback(async () => {
    try {
      const data = await fetchPlansAndConfig();
      if (Array.isArray(data?.plans)) setPlans(data.plans);
      if (data?.config?.rechargeNumbers) setSiteConfig(data.config);
    } catch {
      // Keep default plans/config
    }
  }, []);

  useEffect(() => {
    const syncRoute = () => setIsAdminRoute(checkIsAdminPath());
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const data = await fetchPlansAndConfig();
        if (active) {
          if (Array.isArray(data?.plans)) setPlans(data.plans);
          if (data?.config?.rechargeNumbers) setSiteConfig(data.config);
        }
      } catch {
        // Keep default plans/config
      }

      if (!initialRef && getStoredToken()) {
        try {
          const data = await fetchDashboard();
          if (active) setDashboard(data);
        } catch {
          setStoredToken(null);
        }
      }
      if (active) setBooting(false);
    }
    init();
    return () => {
      active = false;
    };
  }, [initialRef]);

  const handleExitAdminToSite = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch {
      window.location.hash = '';
    }
    setIsAdminRoute(false);
    refreshPublicConfig();
  };

  if (isAdminRoute) {
    return <AdminPanelView onExitToSite={handleExitAdminToSite} />;
  }

  const navigateTo = (target: RouteView, options?: { requireAuth?: boolean }) => {
    if (options?.requireAuth && !dashboard) {
      setPreviousView(view);
      setView('auth');
      return;
    }
    if (target !== view) {
      setPreviousView(view);
      setView(target);
    }
    if (target === 'my') {
      setMySubView('overview');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (view === 'my' && mySubView !== 'overview') {
      setMySubView('overview');
      return;
    }
    if (view === 'home') {
      return;
    }
    setView(previousView === view ? 'home' : previousView);
  };

  const handleLogin = async (phone: string, password: string) => {
    const payload = await loginAccount(phone, password);
    setDashboard(payload);
    setView('home');
    setWelcomeTitle('লগইন সফল হয়েছে — স্বাগতম!');
  };

  const handleRegister = async (phone: string, password: string, inviteCode?: string) => {
    const payload = await registerAccount(phone, password, inviteCode);
    setDashboard(payload);
    setView('home');
    setWelcomeTitle(`নিবন্ধন সফল! ৳ ${siteConfig.registrationBonus} টাকা বোনাস যোগ হয়েছে`);
  };

  const handleLogout = () => {
    setStoredToken(null);
    setDashboard(null);
    setMySubView('overview');
    setView('auth');
  };

  const handleBuyPlan = async (plan: InvestmentPlan) => {
    const payload = await buyPlan(plan.id);
    setDashboard(payload);
  };

  const handleClaimYield = async (productId: string) => {
    const payload = await claimDailyYield(productId);
    setDashboard(payload);
  };

  const handleRecharge = async (amount: number, method: PaymentMethod, txid: string) => {
    const payload = await submitRecharge(amount, method, txid);
    setDashboard(payload);
  };

  const handleWithdraw = async (amount: number, withdrawPassword: string) => {
    const payload = await submitWithdrawal(amount, withdrawPassword);
    setDashboard(payload);
  };

  const handleSaveBank = async (input: {
    network: PaymentMethod;
    walletAddress: string;
    accountName: string;
    withdrawPassword?: string;
    newLoginPassword?: string;
  }) => {
    const payload = await saveBankAndSecurity(input);
    setDashboard(payload);
  };

  const handleSpin = async () => {
    const res = await spinWheel();
    setDashboard(res.payload);
    return res.reward;
  };

  const isAuthenticated = Boolean(dashboard);
  const currentTab: RouteView =
    view === 'recharge' || view === 'withdraw' ? 'my' : view;

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 flex flex-col">
      {/* Desktop 3-Zone Top Bar */}
      <header className="hidden md:block sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-[#4D148C] whitespace-nowrap shrink-0"
          >
            <FeedexLogoImage className="h-6 w-auto" />
            <span>FeedexDigital</span>
          </button>

          <nav className="flex items-center gap-7 text-sm font-medium text-slate-600">
            {(
              [
                ['home', 'হোম', false],
                ['team', 'টিম', true],
                ['invite', 'আমন্ত্রণ', false],
                ['download', 'ডাউনলোড', false],
                ['my', 'আমার পেজ', true],
              ] as const
            ).map(([key, label, needsAuth]) => {
              const active = view === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigateTo(key, { requireAuth: needsAuth })}
                  className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                    active
                      ? 'text-[#0448A2] border-[#0448A2] font-semibold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="shrink-0">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigateTo('recharge', { requireAuth: true })}
                className="px-4 py-2 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-xs font-semibold tabular-nums whitespace-nowrap transition-colors"
              >
                ৳ {dashboard!.user.balance.toFixed(0)} · ডিপোজিট
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigateTo('auth')}
                className="px-4 py-2 rounded-xl bg-[#0448A2] hover:bg-[#033A85] text-white text-xs font-semibold whitespace-nowrap transition-colors"
              >
                লগইন / নিবন্ধন
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Compact Header */}
      <header className="md:hidden sticky top-0 z-40 h-12 bg-white border-b border-slate-100 px-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          aria-label="পেছনে যান"
          className="w-10 h-10 flex items-center justify-center text-slate-800 rounded-lg active:bg-slate-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-slate-900 truncate">
          {view === 'my' && mySubView === 'records'
            ? 'অ্যাকাউন্ট রেকর্ডস'
            : view === 'my' && mySubView === 'products'
              ? 'আমার পণ্যসমূহ'
              : view === 'my' && mySubView === 'bank'
                ? 'পেমেন্ট ও পাসওয়ার্ড'
                : view === 'my' && mySubView === 'company'
                  ? 'কোম্পানি প্রোফাইল'
                  : PAGE_TITLES[view]}
        </h1>
        <FeedexLogoImage className="h-5 w-auto object-contain shrink-0" />
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-8">
        {booting ? (
          <div className="max-w-6xl mx-auto px-4 py-12 text-center text-sm text-slate-400">
            FeedexDigital লোড হচ্ছে...
          </div>
        ) : view === 'auth' ? (
          <AuthView
            siteConfig={siteConfig}
            initialMode={initialRef ? 'register' : 'login'}
            initialInviteCode={initialRef}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onBack={() => navigateTo('home')}
          />
        ) : view === 'home' ? (
          <HomeView
            plans={plans}
            siteConfig={siteConfig}
            isAuthenticated={isAuthenticated}
            userBalance={dashboard?.user.balance ?? 0}
            totalRecharge={dashboard?.user.totalRecharge ?? 0}
            lastSpinDate={dashboard?.user.lastSpinDate ?? null}
            onNavigateRecharge={() => navigateTo('recharge', { requireAuth: true })}
            onNavigateWithdrawal={() => navigateTo('withdraw', { requireAuth: true })}
            onOpenChannel={() => setInfoModal('channel')}
            onOpenSupport={() => setInfoModal('support')}
            onOpenSpin={() => setSpinOpen(true)}
            onBuyPlan={handleBuyPlan}
            onRequireAuth={() => navigateTo('auth')}
          />
        ) : view === 'team' ? (
          <TeamView
            team={dashboard?.team ?? EMPTY_TEAM}
            siteConfig={siteConfig}
            inviteCode={dashboard?.user.inviteCode ?? 'FDX731786'}
            onGoInvite={() => navigateTo('invite')}
          />
        ) : view === 'invite' ? (
          <InviteView
            inviteCode={dashboard?.user.inviteCode ?? 'FDX731786'}
            siteConfig={siteConfig}
            isAuthenticated={isAuthenticated}
            onRequireAuth={() => navigateTo('auth')}
          />
        ) : view === 'download' ? (
          <DownloadView />
        ) : view === 'recharge' && dashboard ? (
          <RechargeView
            balance={dashboard.user.balance}
            siteConfig={siteConfig}
            onRecharge={handleRecharge}
          />
        ) : view === 'withdraw' && dashboard ? (
          <WithdrawView
            balance={dashboard.user.balance}
            totalRecharge={dashboard.user.totalRecharge}
            minWithdraw={siteConfig.minWithdraw}
            bankBinding={dashboard.user.bankBinding}
            onWithdraw={handleWithdraw}
            onGoBindBank={() => {
              setView('my');
              setMySubView('bank');
            }}
            onGoRecharge={() => navigateTo('recharge', { requireAuth: true })}
          />
        ) : view === 'my' && dashboard ? (
          <MyPageView
            user={dashboard.user}
            siteConfig={siteConfig}
            products={dashboard.products}
            records={dashboard.records}
            subView={mySubView}
            onChangeSubView={setMySubView}
            onClaimYield={handleClaimYield}
            onSaveBank={handleSaveBank}
            onNavigateRecharge={() => navigateTo('recharge', { requireAuth: true })}
            onNavigateWithdraw={() => navigateTo('withdraw', { requireAuth: true })}
            onLogout={handleLogout}
          />
        ) : (
          <AuthView
            siteConfig={siteConfig}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onBack={() => navigateTo('home')}
          />
        )}
      </main>

      {/* Mobile Fixed 5-Tab Bottom Bar */}
      {view !== 'auth' && (
        <nav
          aria-label="মোবাইল নেভিগেশন"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[60px] bg-white border-t border-slate-200 grid grid-cols-5 items-center"
        >
          {(
            [
              ['home', 'হোম', Home, false],
              ['team', 'টিম', Users, true],
              ['invite', 'আমন্ত্রণ', Share2, false],
              ['download', 'ডাউনলোড', Download, false],
              ['my', 'আমার', User, true],
            ] as const
          ).map(([key, label, Icon, needsAuth]) => {
            const active = currentTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => navigateTo(key, { requireAuth: needsAuth })}
                className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? 'text-[#0448A2]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.3 : 1.8} />
                <span className="text-[11px] font-medium leading-none">{label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Modals */}
      {spinOpen && (
        <SpinWheelModal
          isAuthenticated={isAuthenticated}
          lastSpinDate={dashboard?.user.lastSpinDate ?? null}
          onSpin={handleSpin}
          onRequireAuth={() => navigateTo('auth')}
          onClose={() => setSpinOpen(false)}
        />
      )}

      {infoModal && (
        <InfoDrawerModal
          kind={infoModal}
          siteConfig={siteConfig}
          onClose={() => setInfoModal(null)}
        />
      )}

      {welcomeTitle && (
        <WelcomeLinksModal
          title={welcomeTitle}
          siteConfig={siteConfig}
          onClose={() => setWelcomeTitle(null)}
        />
      )}
    </div>
  );
}
