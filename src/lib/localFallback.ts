import type {
  AccountRecord,
  AdminOverviewPayload,
  AdminUserDetail,
  DashboardPayload,
  InvestmentPlan,
  PaymentMethod,
  SiteConfig,
  TeamMemberSummary,
  TeamOverview,
  UserProduct,
  UserProfile,
} from '../types';

interface LocalUser {
  id: string;
  memberId: string;
  phone: string;
  password: string;
  withdrawPassword: string | null;
  inviteCode: string;
  referredBy: string | null;
  balance: number;
  totalRecharge: number;
  totalWithdrawal: number;
  lastSpinDate: string | null;
  blocked?: boolean;
  deviceId?: string;
  multiAccountFlag?: boolean;
  bankBinding: {
    network: PaymentMethod;
    walletAddress: string;
    accountName: string;
  } | null;
  createdAt: string;
}

interface LocalDb {
  version: number;
  config: SiteConfig;
  plans: InvestmentPlan[];
  adminPassword: string;
  users: LocalUser[];
  products: UserProduct[];
  records: AccountRecord[];
}

const LOCAL_DB_KEY = 'feedex_digital_local_db_v4';

export const DEFAULT_PLANS: InvestmentPlan[] = [
  {
    id: 'vip-1',
    code: 'ভিআইপি ১',
    name: 'ভিআইপি ১ — এয়ার কার্গো স্টার্টার',
    category: 'daily',
    price: 500,
    dailyIncome: 50,
    cycleDays: 30,
    totalReturn: 1500,
    imagePath: '/assets/aistudio/images__26__5ccb2af9.jpeg',
  },
  {
    id: 'vip-2',
    code: 'ভিআইপি ২',
    name: 'ভিআইপি ২ — এক্সপ্রেস ফ্লিট',
    category: 'daily',
    price: 1000,
    dailyIncome: 110,
    cycleDays: 30,
    totalReturn: 3300,
    imagePath: '/assets/aistudio/80825423_605f44ca.jpg',
  },
  {
    id: 'vip-3',
    code: 'ভিআইপি ৩',
    name: 'ভিআইপি ৩ — ইন্টারন্যাশনাল এয়ারলাইন',
    category: 'daily',
    price: 2000,
    dailyIncome: 230,
    cycleDays: 30,
    totalReturn: 6900,
    imagePath: '/assets/aistudio/e4cf2de03ad051bc28ff33864f809d51_cd43a73c.jpg',
  },
  {
    id: 'vip-4',
    code: 'ভিআইপি ৪',
    name: 'ভিআইপি ৪ — গ্লোবাল হাব পার্টনার',
    category: 'daily',
    price: 5000,
    dailyIncome: 600,
    cycleDays: 30,
    totalReturn: 18000,
    imagePath: '/assets/aistudio/images__9__13d6c096.jpeg',
  },
  {
    id: 'vip-5',
    code: 'ভিআইপি ৫',
    name: 'ভিআইপি ৫ — প্রাইম লজিস্টিকস',
    category: 'daily',
    price: 10000,
    dailyIncome: 1250,
    cycleDays: 30,
    totalReturn: 37500,
    imagePath: '/assets/aistudio/images__8__66bd7665.jpeg',
  },
  {
    id: 'vip-6',
    code: 'ভিআইপি ৬',
    name: 'ভিআইপি ৬ — এক্সিকিউটিভ ফ্রেইট',
    category: 'daily',
    price: 25000,
    dailyIncome: 3300,
    cycleDays: 30,
    totalReturn: 99000,
    imagePath: '/assets/aistudio/e4cf2de03ad051bc28ff33864f809d51_cd43a73c.jpg',
  },
  {
    id: 'welfare-1',
    code: 'কল্যাণ ১',
    name: 'কল্যাণ প্ল্যান ক',
    category: 'welfare',
    price: 300,
    dailyIncome: 75,
    cycleDays: 7,
    totalReturn: 525,
    imagePath: '/assets/aistudio/images__8__66bd7665.jpeg',
  },
  {
    id: 'welfare-2',
    code: 'কল্যাণ ২',
    name: 'কল্যাণ প্ল্যান খ',
    category: 'welfare',
    price: 1200,
    dailyIncome: 280,
    cycleDays: 10,
    totalReturn: 2800,
    imagePath: '/assets/aistudio/images__9__13d6c096.jpeg',
  },
  {
    id: 'welfare-3',
    code: 'কল্যাণ ৩',
    name: 'কল্যাণ প্ল্যান গ',
    category: 'welfare',
    price: 3500,
    dailyIncome: 750,
    cycleDays: 15,
    totalReturn: 11250,
    imagePath: '/assets/aistudio/80825423_605f44ca.jpg',
  },
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  telegramLink: 'https://t.me/FeedexDigitalOfficial',
  supportLink: 'https://t.me/FeedexDigitalSupport',
  rechargeNumbers: {
    বিকাশ: '01700001122',
    নগদ: '01800003344',
    রকেট: '01900005566',
  },
  referralRates: {
    level1: 12,
    level2: 5,
    level3: 2,
  },
  registrationBonus: 150,
  minDeposit: 300,
  minWithdraw: 100,
  autoApproveDeposit: false,
};

function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePhone(raw: string): string {
  let cleaned = raw.trim().replace(/[\s\-().]/g, '');
  if (cleaned.startsWith('+880')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('00880')) {
    cleaned = '0' + cleaned.slice(5);
  } else if (cleaned.startsWith('8801') && cleaned.length >= 13) {
    cleaned = '0' + cleaned.slice(3);
  }
  return cleaned.replace(/[^0-9]/g, '');
}

function createInitialLocalDb(): LocalDb {
  return {
    version: 4,
    config: structuredClone(DEFAULT_SITE_CONFIG),
    plans: structuredClone(DEFAULT_PLANS),
    adminPassword: 'Admin@7860',
    users: [],
    products: [],
    records: [],
  };
}

let memoryDb: LocalDb | null = null;

function loadLocalDb(): LocalDb {
  try {
    const raw = localStorage.getItem(LOCAL_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LocalDb;
      if (
        parsed.version === 4 &&
        parsed.config &&
        Array.isArray(parsed.plans) &&
        Array.isArray(parsed.users)
      ) {
        parsed.config.autoApproveDeposit = false;
        return parsed;
      }
    }
  } catch {
    // Ignore storage error
  }
  if (!memoryDb) {
    memoryDb = createInitialLocalDb();
  }
  saveLocalDb(memoryDb);
  return memoryDb;
}

function saveLocalDb(db: LocalDb): void {
  memoryDb = db;
  try {
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
  } catch {
    // Ignore storage error
  }
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}

function sanitizeUser(user: LocalUser): UserProfile {
  return {
    id: user.id,
    memberId: user.memberId,
    phone: user.phone,
    inviteCode: user.inviteCode,
    referredBy: user.referredBy,
    balance: Number(user.balance.toFixed(2)),
    totalRecharge: Number(user.totalRecharge.toFixed(2)),
    totalWithdrawal: Number(user.totalWithdrawal.toFixed(2)),
    lastSpinDate: user.lastSpinDate,
    blocked: Boolean(user.blocked),
    multiAccountFlag: Boolean(user.multiAccountFlag),
    bankBinding: user.bankBinding
      ? {
          network: user.bankBinding.network,
          walletAddress: user.bankBinding.walletAddress,
          accountName: user.bankBinding.accountName,
          hasWithdrawPassword: Boolean(user.withdrawPassword),
        }
      : user.withdrawPassword
        ? {
            network: 'বিকাশ',
            walletAddress: '',
            accountName: '',
            hasWithdrawPassword: true,
          }
        : null,
    createdAt: user.createdAt,
  };
}

function computeTeamOverview(db: LocalDb, userId: string): TeamOverview {
  const assetsMap = new Map<string, number>();
  for (const prd of db.products) {
    if (prd.status === 'সক্রিয়') {
      assetsMap.set(prd.userId, (assetsMap.get(prd.userId) || 0) + prd.price);
    }
  }
  const l1Users = db.users.filter((u) => u.referredBy === userId);
  const l1Ids = new Set(l1Users.map((u) => u.id));
  const l2Users = db.users.filter((u) => u.referredBy && l1Ids.has(u.referredBy));
  const l2Ids = new Set(l2Users.map((u) => u.id));
  const l3Users = db.users.filter((u) => u.referredBy && l2Ids.has(u.referredBy));

  const toSummary = (u: LocalUser, level: 1 | 2 | 3): TeamMemberSummary => ({
    id: u.id,
    memberId: u.memberId,
    phoneMasked: maskPhone(u.phone),
    level,
    rechargeTotal: Number(u.totalRecharge.toFixed(2)),
    assetsTotal: Number((assetsMap.get(u.id) || 0).toFixed(2)),
    joinedAt: u.createdAt,
  });

  const l1 = l1Users.map((u) => toSummary(u, 1));
  const l2 = l2Users.map((u) => toSummary(u, 2));
  const l3 = l3Users.map((u) => toSummary(u, 3));
  const all = [...l1, ...l2, ...l3];

  return {
    teamRecharge: Number(all.reduce((acc, m) => acc + m.rechargeTotal, 0).toFixed(2)),
    teamAssets: Number(all.reduce((acc, m) => acc + m.assetsTotal, 0).toFixed(2)),
    teamNumber: all.length,
    levels: { 1: l1, 2: l2, 3: l3 },
  };
}

function creditCommissions(
  db: LocalDb,
  sourceUser: LocalUser,
  baseAmount: number,
  reasonLabel: string,
  now: string
) {
  const rates = [
    db.config.referralRates.level1 / 100,
    db.config.referralRates.level2 / 100,
    db.config.referralRates.level3 / 100,
  ];
  let currentRefId = sourceUser.referredBy;
  for (let tier = 0; tier < 3 && currentRefId; tier++) {
    const upline = db.users.find((u) => u.id === currentRefId);
    if (!upline) break;
    const bonus = Number((baseAmount * rates[tier]).toFixed(2));
    if (bonus > 0) {
      upline.balance = Number((upline.balance + bonus).toFixed(2));
      db.records.unshift({
        id: genId('rec'),
        userId: upline.id,
        type: 'commission',
        title: `লেভেল-${tier + 1} রেফার কমিশন (${reasonLabel})`,
        amount: bonus,
        direction: 'credit',
        status: 'সম্পন্ন',
        reference: sourceUser.memberId,
        createdAt: now,
      });
    }
    currentRefId = upline.referredBy;
  }
}

function makeLocalToken(role: 'user' | 'admin', id: string): string {
  return `local_${role}:${id}`;
}

function parseLocalToken(token: string | null, expectedRole: 'user' | 'admin'): string {
  const prefix = `local_${expectedRole}:`;
  if (!token || !token.startsWith(prefix)) {
    throw new Error(
      expectedRole === 'admin'
        ? 'অননুমোদিত প্রবেশ! শুধুমাত্র এডমিন প্রবেশ করতে পারবেন।'
        : 'অনুগ্রহ করে আগে লগইন করুন।'
    );
  }
  return token.slice(prefix.length);
}

function buildDashboard(db: LocalDb, userId: string): DashboardPayload {
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error('অ্যাকাউন্ট পাওয়া যায়নি।');
  if (user.blocked) throw new Error('আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে।');
  return {
    user: sanitizeUser(user),
    products: db.products
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()),
    records: db.records
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    team: computeTeamOverview(db, userId),
  };
}

function buildAdminOverview(db: LocalDb): AdminOverviewPayload {
  const userById = new Map(db.users.map((u) => [u.id, u]));
  const pendingDeposits = db.records
    .filter((r) => r.type === 'recharge' && r.status === 'অপেক্ষমাণ')
    .map((r) => {
      const u = userById.get(r.userId);
      return {
        ...r,
        userPhone: u?.phone || 'অজানা',
        memberId: u?.memberId || '-',
      };
    });

  return {
    totalUsers: db.users.length,
    totalDeposits: Number(db.users.reduce((acc, u) => acc + u.totalRecharge, 0).toFixed(2)),
    totalWithdrawals: Number(db.users.reduce((acc, u) => acc + u.totalWithdrawal, 0).toFixed(2)),
    config: db.config,
    plans: db.plans,
    users: db.users
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(sanitizeUser),
    pendingDeposits,
  };
}

function lookupMemberDetail(db: LocalDb, query: string): AdminUserDetail {
  const q = query.trim();
  if (!q) throw new Error('অনুগ্রহ করে সদস্যের আইডি অথবা মোবাইল নম্বর লিখুন।');
  const user = db.users.find(
    (u) =>
      u.memberId === q ||
      u.phone === q ||
      u.inviteCode.toUpperCase() === q.toUpperCase() ||
      u.phone.includes(q) ||
      u.memberId.includes(q)
  );
  if (!user) throw new Error(`"${q}" দিয়ে কোনো সদস্য খুঁজে পাওয়া যায়নি।`);
  return {
    user: sanitizeUser(user),
    products: db.products.filter((p) => p.userId === user.id),
    records: db.records
      .filter((r) => r.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    team: computeTeamOverview(db, user.id),
  };
}

export function handleLocalApi<T>(
  url: string,
  options: RequestInit = {},
  token: string | null = null
): T {
  const db = loadLocalDb();
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? (JSON.parse(String(options.body)) as Record<string, unknown>) : {};
  const [pathname, search] = url.split('?');

  if (pathname === '/api/plans' && method === 'GET') {
    return { plans: db.plans, config: db.config } as T;
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    const phone = normalizePhone(String(body.phone || ''));
    const password = String(body.password || '');
    const inviteCode = typeof body.inviteCode === 'string' ? body.inviteCode.trim() : '';
    if (phone.length < 8 || phone.length > 15) throw new Error('অনুগ্রহ করে সঠিক মোবাইল নম্বর দিন।');
    if (password.length < 4) throw new Error('লগইন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
    if (db.users.some((u) => normalizePhone(u.phone) === phone)) {
      throw new Error(
        'মাল্টিপল অ্যাকাউন্ট সনাক্ত হয়েছে! এই মোবাইল নম্বর দিয়ে আগেই নিবন্ধন করা হয়েছে। একটি নম্বর দিয়ে শুধুমাত্র একবারই নিবন্ধন করা যাবে।'
      );
    }
    let referrerId: string | null = null;
    if (inviteCode) {
      const refUser = db.users.find((u) => u.inviteCode.toUpperCase() === inviteCode.toUpperCase());
      if (!refUser) throw new Error('রেফার কোডটি সঠিক নয়।');
      referrerId = refUser.id;
    }
    const headersObj = (options.headers as Record<string, string> | undefined) || {};
    const deviceId = (headersObj['X-Client-Id'] || headersObj['x-client-id'] || '').trim();
    let multiAccountFlag = false;
    if (deviceId) {
      const sameDevice = db.users.filter((u) => u.deviceId && u.deviceId === deviceId);
      if (sameDevice.length > 0) {
        multiAccountFlag = true;
        for (const existing of sameDevice) {
          existing.multiAccountFlag = true;
        }
      }
    }

    const randomDigits = String(Math.floor(100000000 + Math.random() * 899999999));
    const newUserId = genId('usr');
    const now = new Date().toISOString();
    const welcomeBonus = Number(db.config.registrationBonus) || 150;
    const newUser: LocalUser = {
      id: newUserId,
      memberId: randomDigits,
      phone,
      password,
      withdrawPassword: null,
      inviteCode: `FDX${randomDigits.slice(-6)}`,
      referredBy: referrerId,
      balance: welcomeBonus,
      totalRecharge: 0,
      totalWithdrawal: 0,
      lastSpinDate: null,
      blocked: false,
      deviceId: deviceId || undefined,
      multiAccountFlag,
      bankBinding: null,
      createdAt: now,
    };
    db.users.push(newUser);
    db.records.unshift({
      id: genId('rec'),
      userId: newUserId,
      type: 'bonus',
      title: 'নতুন নিবন্ধন বোনাস',
      amount: welcomeBonus,
      direction: 'credit',
      status: 'সম্পন্ন',
      reference: `WELCOME-${welcomeBonus}`,
      createdAt: now,
    });
    saveLocalDb(db);
    return {
      token: makeLocalToken('user', newUserId),
      payload: buildDashboard(db, newUserId),
    } as T;
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    const phone = normalizePhone(String(body.phone || ''));
    const password = String(body.password || '');
    const user = db.users.find((u) => normalizePhone(u.phone) === phone && u.password === password);
    if (!user) throw new Error('মোবাইল নম্বর অথবা পাসওয়ার্ড ভুল হয়েছে।');
    if (user.blocked) throw new Error('আপনার অ্যাকাউন্টটি সাময়িকভাবে বন্ধ রয়েছে। সাপোর্টে যোগাযোগ করুন।');
    return {
      token: makeLocalToken('user', user.id),
      payload: buildDashboard(db, user.id),
    } as T;
  }

  if (pathname === '/api/me' && method === 'GET') {
    const userId = parseLocalToken(token, 'user');
    return { payload: buildDashboard(db, userId) } as T;
  }

  if (pathname === '/api/products/buy' && method === 'POST') {
    const userId = parseLocalToken(token, 'user');
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('অ্যাকাউন্ট পাওয়া যায়নি।');
    if (user.totalRecharge <= 0) {
      throw new Error('প্ল্যান কেনার আগে অনুগ্রহ করে ডিপোজিট (রিচার্জ) সম্পন্ন করুন। ডিপোজিট ছাড়া কোনো প্ল্যান কেনা যাবে না।');
    }
    const plan = db.plans.find((p) => p.id === body.planId);
    if (!plan) throw new Error('নির্বাচিত প্ল্যানটি পাওয়া যায়নি।');
    if (user.balance < plan.price) {
      throw new Error(`ব্যালেন্স অপর্যাপ্ত। প্রয়োজন ৳ ${plan.price.toFixed(0)}, আপনার ব্যালেন্স ৳ ${user.balance.toFixed(0)}।`);
    }
    const now = new Date().toISOString();
    user.balance = Number((user.balance - plan.price).toFixed(2));
    const prd: UserProduct = {
      id: genId('prd'),
      userId: user.id,
      planId: plan.id,
      planName: plan.name,
      category: plan.category,
      price: plan.price,
      dailyIncome: plan.dailyIncome,
      cycleDays: plan.cycleDays,
      claimedDays: 0,
      totalEarned: 0,
      purchasedAt: now,
      lastClaimedAt: null,
      status: 'সক্রিয়',
    };
    db.products.unshift(prd);
    db.records.unshift({
      id: genId('rec'),
      userId: user.id,
      type: 'purchase',
      title: `${plan.name} ক্রয় করা হয়েছে`,
      amount: plan.price,
      direction: 'debit',
      status: 'সম্পন্ন',
      reference: prd.id.toUpperCase(),
      createdAt: now,
    });
    creditCommissions(db, user, plan.price, plan.code, now);
    saveLocalDb(db);
    return { payload: buildDashboard(db, userId) } as T;
  }

  if (pathname === '/api/products/claim' && method === 'POST') {
    const userId = parseLocalToken(token, 'user');
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('অ্যাকাউন্ট পাওয়া যায়নি।');
    const product = db.products.find((p) => p.id === body.productId && p.userId === userId);
    if (!product) throw new Error('প্ল্যানের তথ্য পাওয়া যায়নি।');
    if (product.status === 'সম্পন্ন' || product.claimedDays >= product.cycleDays) {
      throw new Error('এই প্ল্যানের সব মেয়াদের আয় সংগ্রহ করা সম্পন্ন হয়েছে।');
    }
    const now = new Date().toISOString();
    product.claimedDays += 1;
    product.totalEarned = Number((product.totalEarned + product.dailyIncome).toFixed(2));
    product.lastClaimedAt = now;
    if (product.claimedDays >= product.cycleDays) product.status = 'সম্পন্ন';
    user.balance = Number((user.balance + product.dailyIncome).toFixed(2));
    db.records.unshift({
      id: genId('rec'),
      userId: user.id,
      type: 'income',
      title: `${product.planName} দৈনিক আয় (দিন ${product.claimedDays}/${product.cycleDays})`,
      amount: product.dailyIncome,
      direction: 'credit',
      status: 'সম্পন্ন',
      reference: product.id.toUpperCase(),
      createdAt: now,
    });
    saveLocalDb(db);
    return { payload: buildDashboard(db, userId) } as T;
  }

  if (pathname === '/api/recharge' && method === 'POST') {
    const userId = parseLocalToken(token, 'user');
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('অ্যাকাউন্ট পাওয়া যায়নি।');
    const amount = Number(body.amount);
    const payMethod = body.method as PaymentMethod;
    const txid = String(body.txid || '').trim().replace(/\s+/g, '').toUpperCase();
    if (payMethod !== 'বিকাশ' && payMethod !== 'নগদ' && payMethod !== 'রকেট') {
      throw new Error('অনুগ্রহ করে বিকাশ, নগদ অথবা রকেট নির্বাচন করুন।');
    }
    if (txid.length < 4) {
      throw new Error('সেন্ড মানি করার পর সঠিক ট্রানজেকশন আইডি (Transaction ID) দিন।');
    }
    const duplicateTxid = db.records.some(
      (r) =>
        r.type === 'recharge' &&
        (r.reference || '').trim().replace(/\s+/g, '').toUpperCase() === txid
    );
    if (duplicateTxid) {
      throw new Error(
        'এই ট্রানজেকশন আইডি (Transaction ID) ইতিমধ্যে ব্যবহার করা হয়েছে। একই ট্রানজেকশন আইডি ২ বার দেওয়া যাবে না।'
      );
    }
    const minDep = db.config.minDeposit || 300;
    if (!Number.isFinite(amount) || amount < minDep) {
      throw new Error(`সর্বনিম্ন ডিপোজিট (রিচার্জ) পরিমাণ ৳ ${minDep}।`);
    }
    if (amount > 500000) {
      throw new Error('একবারে সর্বোচ্চ ডিপোজিট সীমা ৳ ৫,০০,০০০।');
    }
    const now = new Date().toISOString();
    db.records.unshift({
      id: genId('rec'),
      userId: user.id,
      type: 'recharge',
      title: `${payMethod} সেন্ড মানি ডিপোজিট`,
      amount: Number(amount.toFixed(2)),
      direction: 'credit',
      status: 'অপেক্ষমাণ',
      method: payMethod,
      reference: txid,
      createdAt: now,
    });
    saveLocalDb(db);
    return { payload: buildDashboard(db, userId) } as T;
  }

  if (pathname === '/api/withdraw' && method === 'POST') {
    const userId = parseLocalToken(token, 'user');
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('অ্যাকাউন্ট পাওয়া যায়নি।');
    if (user.totalRecharge <= 0) {
      throw new Error('উত্তোলন করার আগে কমপক্ষে একবার ডিপোজিট (রিচার্জ) সম্পন্ন করতে হবে।');
    }
    if (!user.bankBinding?.walletAddress) {
      throw new Error('প্রথমে আপনার বিকাশ, নগদ বা রকেট নম্বর যুক্ত করুন।');
    }
    if (!user.withdrawPassword || user.withdrawPassword !== body.withdrawPassword) {
      throw new Error('উত্তোলন পাসওয়ার্ড সঠিক নয়।');
    }
    const amount = Number(body.amount);
    const minWd = db.config.minWithdraw || 100;
    if (!Number.isFinite(amount) || amount < minWd) {
      throw new Error(`সর্বনিম্ন উত্তোলন পরিমাণ ৳ ${minWd}।`);
    }
    if (amount > user.balance) throw new Error('আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই।');
    const now = new Date().toISOString();
    user.balance = Number((user.balance - amount).toFixed(2));
    user.totalWithdrawal = Number((user.totalWithdrawal + amount).toFixed(2));
    db.records.unshift({
      id: genId('rec'),
      userId: user.id,
      type: 'withdrawal',
      title: `${user.bankBinding.network} মাধ্যমে উত্তোলন`,
      amount,
      direction: 'debit',
      status: 'সম্পন্ন',
      method: user.bankBinding.network,
      reference: user.bankBinding.walletAddress,
      createdAt: now,
    });
    saveLocalDb(db);
    return { payload: buildDashboard(db, userId) } as T;
  }

  if (pathname === '/api/bank-card' && method === 'POST') {
    const userId = parseLocalToken(token, 'user');
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('অ্যাকাউন্ট পাওয়া যায়নি।');
    const walletAddress = String(body.walletAddress || '').trim();
    const accountName = String(body.accountName || '').trim();
    if (walletAddress.length < 6) throw new Error('অনুগ্রহ করে সঠিক বিকাশ, নগদ বা রকেট নম্বর দিন।');
    if (!accountName) throw new Error('অ্যাকাউন্ট হোল্ডারের নাম লিখুন।');
    user.bankBinding = {
      network: body.network as PaymentMethod,
      walletAddress,
      accountName,
    };
    if (typeof body.withdrawPassword === 'string' && body.withdrawPassword.trim()) {
      user.withdrawPassword = body.withdrawPassword.trim();
    }
    if (typeof body.newLoginPassword === 'string' && body.newLoginPassword.trim()) {
      user.password = body.newLoginPassword.trim();
    }
    saveLocalDb(db);
    return { payload: buildDashboard(db, userId) } as T;
  }

  if (pathname === '/api/spin' && method === 'POST') {
    const userId = parseLocalToken(token, 'user');
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('অ্যাকাউন্ট পাওয়া যায়নি।');
    const today = new Date().toISOString().slice(0, 10);
    if (user.lastSpinDate === today) {
      throw new Error('আজকের দৈনিক স্পিন বোনাস ইতিমধ্যে সংগ্রহ করা হয়েছে। আগামীকাল আবার চেষ্টা করুন।');
    }
    const rewards = [10, 20, 30, 50, 75, 100];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    const now = new Date().toISOString();
    user.lastSpinDate = today;
    user.balance = Number((user.balance + reward).toFixed(2));
    db.records.unshift({
      id: genId('rec'),
      userId: user.id,
      type: 'bonus',
      title: 'দৈনিক লাকি হুইল বোনাস',
      amount: reward,
      direction: 'credit',
      status: 'সম্পন্ন',
      reference: `SPIN-${today}`,
      createdAt: now,
    });
    saveLocalDb(db);
    return { reward, payload: buildDashboard(db, userId) } as T;
  }

  // Admin Fallback Routes
  if (pathname === '/api/admin/login' && method === 'POST') {
    if (String(body.username || '').trim() !== 'feedexadmin' || body.password !== db.adminPassword) {
      throw new Error('এডমিন ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়।');
    }
    return {
      token: makeLocalToken('admin', 'feedexadmin'),
      overview: buildAdminOverview(db),
    } as T;
  }

  if (pathname.startsWith('/api/admin/')) {
    parseLocalToken(token, 'admin');
  }

  if (pathname === '/api/admin/overview' && method === 'GET') {
    return { overview: buildAdminOverview(db) } as T;
  }

  if (pathname === '/api/admin/user-lookup' && method === 'GET') {
    const params = new URLSearchParams(search || '');
    return { detail: lookupMemberDetail(db, params.get('q') || '') } as T;
  }

  if (pathname === '/api/admin/user-balance' && method === 'POST') {
    const user = db.users.find((u) => u.id === body.userId);
    if (!user) throw new Error('সদস্য পাওয়া যায়নি।');
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('সঠিক টাকার পরিমাণ লিখুন।');
    const now = new Date().toISOString();
    if (body.operation === 'add') {
      user.balance = Number((user.balance + amount).toFixed(2));
      db.records.unshift({
        id: genId('rec'),
        userId: user.id,
        type: 'admin',
        title: String(body.note || '').trim() || 'এডমিন কর্তৃক ব্যালেন্স যোগ',
        amount,
        direction: 'credit',
        status: 'সম্পন্ন',
        reference: 'ADMIN-ADD',
        createdAt: now,
      });
    } else {
      if (user.balance < amount) {
        throw new Error(`সদস্যের ব্যালেন্স (৳ ${user.balance}) এর চেয়ে বেশি কাটা যাবে না।`);
      }
      user.balance = Number((user.balance - amount).toFixed(2));
      db.records.unshift({
        id: genId('rec'),
        userId: user.id,
        type: 'admin',
        title: String(body.note || '').trim() || 'এডমিন কর্তৃক ব্যালেন্স কর্তন',
        amount,
        direction: 'debit',
        status: 'সম্পন্ন',
        reference: 'ADMIN-DEDUCT',
        createdAt: now,
      });
    }
    saveLocalDb(db);
    return { detail: lookupMemberDetail(db, user.memberId), overview: buildAdminOverview(db) } as T;
  }

  if (pathname === '/api/admin/user-block' && method === 'POST') {
    const user = db.users.find((u) => u.id === body.userId);
    if (!user) throw new Error('সদস্য পাওয়া যায়নি।');
    user.blocked = Boolean(body.blocked);
    saveLocalDb(db);
    return { detail: lookupMemberDetail(db, user.memberId), overview: buildAdminOverview(db) } as T;
  }

  if (pathname === '/api/admin/deposit-resolve' && method === 'POST') {
    const rec = db.records.find((r) => r.id === body.recordId && r.type === 'recharge');
    if (!rec) throw new Error('ডিপোজিট রেকর্ড পাওয়া যায়নি।');
    if (rec.status !== 'অপেক্ষমাণ') {
      throw new Error('এই ডিপোজিটটি ইতিমধ্যে প্রক্রিয়াকরণ হয়েছে।');
    }
    const user = db.users.find((u) => u.id === rec.userId);
    if (!user) throw new Error('সদস্য পাওয়া যায়নি।');
    if (body.action === 'approve') {
      rec.status = 'সম্পন্ন';
      user.balance = Number((user.balance + rec.amount).toFixed(2));
      user.totalRecharge = Number((user.totalRecharge + rec.amount).toFixed(2));
      creditCommissions(db, user, rec.amount, `${rec.method || ''} ডিপোজিট`, new Date().toISOString());
    } else {
      rec.status = 'বাতিল';
    }
    saveLocalDb(db);
    return { overview: buildAdminOverview(db) } as T;
  }

  if (pathname === '/api/admin/config' && method === 'POST') {
    const partial = body as Partial<SiteConfig>;
    db.config = {
      ...db.config,
      ...partial,
      autoApproveDeposit: false,
      rechargeNumbers: partial.rechargeNumbers
        ? { ...db.config.rechargeNumbers, ...partial.rechargeNumbers }
        : db.config.rechargeNumbers,
      referralRates: partial.referralRates
        ? { ...db.config.referralRates, ...partial.referralRates }
        : db.config.referralRates,
    };
    saveLocalDb(db);
    return { overview: buildAdminOverview(db) } as T;
  }

  if (pathname === '/api/admin/plan' && method === 'POST') {
    const plan = db.plans.find((p) => p.id === body.planId);
    if (!plan) throw new Error('প্ল্যান পাওয়া যায়নি।');
    if (typeof body.name === 'string' && body.name.trim()) plan.name = body.name.trim();
    if (typeof body.price === 'number' && body.price > 0) plan.price = body.price;
    if (typeof body.dailyIncome === 'number' && body.dailyIncome > 0) plan.dailyIncome = body.dailyIncome;
    if (typeof body.cycleDays === 'number' && body.cycleDays > 0) plan.cycleDays = Math.round(body.cycleDays);
    if (typeof body.totalReturn === 'number' && body.totalReturn > 0) plan.totalReturn = body.totalReturn;
    saveLocalDb(db);
    return { overview: buildAdminOverview(db) } as T;
  }

  if (pathname === '/api/admin/password' && method === 'POST') {
    const newPassword = String(body.newPassword || '').trim();
    if (newPassword.length < 6) throw new Error('নতুন এডমিন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
    db.adminPassword = newPassword;
    saveLocalDb(db);
    return { ok: true } as T;
  }

  throw new Error('অবৈধ অনুরোধ।');
}
