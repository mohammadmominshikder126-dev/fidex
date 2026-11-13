import { handleLocalApi } from './localFallback';
import type {
  AdminOverviewPayload,
  AdminUserDetail,
  DashboardPayload,
  InvestmentPlan,
  PaymentMethod,
  SiteConfig,
} from '../types';

const TOKEN_STORAGE_KEY = 'feedex_digital_token';
const ADMIN_TOKEN_STORAGE_KEY = 'feedex_digital_admin_token';
const DEVICE_ID_STORAGE_KEY = 'feedex_digital_device_id';

function getClientDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (!id) {
      id = `dev_${Math.random().toString(36).slice(2, 12)}_${Date.now().toString(36)}`;
      localStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

export function getStoredToken(): string | null {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage error
  }
}

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage error
  }
}

async function requestJson<T>(
  url: string,
  options: RequestInit = {},
  tokenOverride?: string | null
): Promise<T> {
  const token = tokenOverride !== undefined ? tokenOverride : getStoredToken();
  const deviceId = getClientDeviceId();
  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(deviceId ? { 'X-Client-Id': deviceId } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    mergedHeaders.Authorization = `Bearer ${token}`;
  }

  if (token?.startsWith('local_')) {
    return handleLocalApi<T>(url, { ...options, headers: mergedHeaders }, token);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: mergedHeaders,
    });
  } catch {
    return handleLocalApi<T>(url, { ...options, headers: mergedHeaders }, token);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return handleLocalApi<T>(url, { ...options, headers: mergedHeaders }, token);
  }

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `অনুরোধ ব্যর্থ হয়েছে (${res.status})`);
  }
  return data;
}

export async function fetchPlansAndConfig(): Promise<{
  plans: InvestmentPlan[];
  config: SiteConfig;
}> {
  return requestJson<{ plans: InvestmentPlan[]; config: SiteConfig }>('/api/plans', {}, null);
}

export async function registerAccount(phone: string, password: string, inviteCode?: string) {
  const res = await requestJson<{ token: string; payload: DashboardPayload }>(
    '/api/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({ phone, password, inviteCode }),
    },
    null
  );
  setStoredToken(res.token);
  return res.payload;
}

export async function loginAccount(phone: string, password: string) {
  const res = await requestJson<{ token: string; payload: DashboardPayload }>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    },
    null
  );
  setStoredToken(res.token);
  return res.payload;
}

export async function fetchDashboard(): Promise<DashboardPayload> {
  const res = await requestJson<{ payload: DashboardPayload }>('/api/me');
  return res.payload;
}

export async function buyPlan(planId: string): Promise<DashboardPayload> {
  const res = await requestJson<{ payload: DashboardPayload }>('/api/products/buy', {
    method: 'POST',
    body: JSON.stringify({ planId }),
  });
  return res.payload;
}

export async function claimDailyYield(productId: string): Promise<DashboardPayload> {
  const res = await requestJson<{ payload: DashboardPayload }>('/api/products/claim', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
  return res.payload;
}

export async function submitRecharge(
  amount: number,
  method: PaymentMethod,
  txid: string
): Promise<DashboardPayload> {
  const res = await requestJson<{ payload: DashboardPayload }>('/api/recharge', {
    method: 'POST',
    body: JSON.stringify({ amount, method, txid }),
  });
  return res.payload;
}

export async function submitWithdrawal(amount: number, withdrawPassword: string): Promise<DashboardPayload> {
  const res = await requestJson<{ payload: DashboardPayload }>('/api/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount, withdrawPassword }),
  });
  return res.payload;
}

export async function saveBankAndSecurity(input: {
  network: PaymentMethod;
  walletAddress: string;
  accountName: string;
  withdrawPassword?: string;
  newLoginPassword?: string;
}): Promise<DashboardPayload> {
  const res = await requestJson<{ payload: DashboardPayload }>('/api/bank-card', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return res.payload;
}

export async function spinWheel(): Promise<{ reward: number; payload: DashboardPayload }> {
  return requestJson<{ reward: number; payload: DashboardPayload }>('/api/spin', {
    method: 'POST',
  });
}

// ================= ADMIN API CLIENT =================

export async function loginAdminAccount(
  username: string,
  password: string
): Promise<AdminOverviewPayload> {
  const res = await requestJson<{ token: string; overview: AdminOverviewPayload }>(
    '/api/admin/login',
    {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    },
    null
  );
  setAdminToken(res.token);
  return res.overview;
}

export async function fetchAdminOverview(): Promise<AdminOverviewPayload> {
  const res = await requestJson<{ overview: AdminOverviewPayload }>(
    '/api/admin/overview',
    {},
    getAdminToken()
  );
  return res.overview;
}

export async function lookupAdminUser(query: string): Promise<AdminUserDetail> {
  const res = await requestJson<{ detail: AdminUserDetail }>(
    `/api/admin/user-lookup?q=${encodeURIComponent(query)}`,
    {},
    getAdminToken()
  );
  return res.detail;
}

export async function adjustAdminUserBalance(input: {
  userId: string;
  operation: 'add' | 'deduct';
  amount: number;
  note?: string;
}): Promise<{ detail: AdminUserDetail; overview: AdminOverviewPayload }> {
  return requestJson<{ detail: AdminUserDetail; overview: AdminOverviewPayload }>(
    '/api/admin/user-balance',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    getAdminToken()
  );
}

export async function toggleAdminUserBlock(
  userId: string,
  blocked: boolean
): Promise<{ detail: AdminUserDetail; overview: AdminOverviewPayload }> {
  return requestJson<{ detail: AdminUserDetail; overview: AdminOverviewPayload }>(
    '/api/admin/user-block',
    {
      method: 'POST',
      body: JSON.stringify({ userId, blocked }),
    },
    getAdminToken()
  );
}

export async function resolveAdminDeposit(
  recordId: string,
  action: 'approve' | 'reject'
): Promise<AdminOverviewPayload> {
  const res = await requestJson<{ overview: AdminOverviewPayload }>(
    '/api/admin/deposit-resolve',
    {
      method: 'POST',
      body: JSON.stringify({ recordId, action }),
    },
    getAdminToken()
  );
  return res.overview;
}

export async function saveAdminConfig(config: Partial<SiteConfig>): Promise<AdminOverviewPayload> {
  const res = await requestJson<{ overview: AdminOverviewPayload }>(
    '/api/admin/config',
    {
      method: 'POST',
      body: JSON.stringify(config),
    },
    getAdminToken()
  );
  return res.overview;
}

export async function saveAdminPlan(input: {
  planId: string;
  name?: string;
  price?: number;
  dailyIncome?: number;
  cycleDays?: number;
  totalReturn?: number;
}): Promise<AdminOverviewPayload> {
  const res = await requestJson<{ overview: AdminOverviewPayload }>(
    '/api/admin/plan',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    getAdminToken()
  );
  return res.overview;
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
  await requestJson<{ ok: boolean }>(
    '/api/admin/password',
    {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    },
    getAdminToken()
  );
}
