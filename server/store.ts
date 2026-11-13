import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
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
} from '../src/types';

interface StoredUser {
  id: string;
  memberId: string;
  phone: string;
  passwordHash: string;
  withdrawPasswordHash: string | null;
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

interface DatabaseSchema {
  version: number;
  config: SiteConfig;
  plans: InvestmentPlan[];
  adminPasswordHash: string;
  users: StoredUser[];
  products: UserProduct[];
  records: AccountRecord[];
}

const STORE_VERSION = 4;

const DEFAULT_PLANS: InvestmentPlan[] = [
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

const DEFAULT_CONFIG: SiteConfig = {
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

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'feedexadmin';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@7860';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'feedex_db.json');
const TOKEN_SECRET = process.env.SESSION_SECRET || 'feedex-digital-partner-secret-2026';

export function hashPassword(raw: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(raw, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(raw: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const derived = crypto.scryptSync(raw, salt, 64);
  const hashBuf = Buffer.from(hash, 'hex');
  if (derived.length !== hashBuf.length) return false;
  return crypto.timingSafeEqual(derived, hashBuf);
}

export function signToken(subject: string, role: 'user' | 'admin' = 'user'): string {
  const payload = Buffer.from(JSON.stringify({ uid: subject, role, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyToken(token: string, expectedRole: 'user' | 'admin' = 'user'): string | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      uid?: string;
      role?: string;
    };
    if (typeof parsed.uid !== 'string') return null;
    if ((parsed.role || 'user') !== expectedRole) return null;
    return parsed.uid;
  } catch {
    return null;
  }
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

function createInitialDb(): DatabaseSchema {
  return {
    version: STORE_VERSION,
    config: structuredClone(DEFAULT_CONFIG),
    plans: structuredClone(DEFAULT_PLANS),
    adminPasswordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
    users: [],
    products: [],
    records: [],
  };
}

function loadDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initial = createInitialDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (
      parsed.version !== STORE_VERSION ||
      !parsed.config ||
      !Array.isArray(parsed.plans) ||
      !Array.isArray(parsed.users) ||
      !Array.isArray(parsed.products) ||
      !Array.isArray(parsed.records)
    ) {
      throw new Error('Schema upgrade needed');
    }
    parsed.config.autoApproveDeposit = false;
    return parsed;
  } catch {
    const initial = createInitialDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function saveDb(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_PATH);
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}

function sanitizeUser(user: StoredUser): UserProfile {
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
          hasWithdrawPassword: Boolean(user.withdrawPasswordHash),
        }
      : user.withdrawPasswordHash
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

function computeTeamOverview(db: DatabaseSchema, userId: string): TeamOverview {
  const userAssetsMap = new Map<string, number>();
  for (const product of db.products) {
    if (product.status === 'সক্রিয়') {
      userAssetsMap.set(product.userId, (userAssetsMap.get(product.userId) || 0) + product.price);
    }
  }

  const level1Users = db.users.filter((u) => u.referredBy === userId);
  const level1Ids = new Set(level1Users.map((u) => u.id));
  const level2Users = db.users.filter((u) => u.referredBy && level1Ids.has(u.referredBy));
  const level2Ids = new Set(level2Users.map((u) => u.id));
  const level3Users = db.users.filter((u) => u.referredBy && level2Ids.has(u.referredBy));

  const toSummary = (u: StoredUser, level: 1 | 2 | 3): TeamMemberSummary => ({
    id: u.id,
    memberId: u.memberId,
    phoneMasked: maskPhone(u.phone),
    level,
    rechargeTotal: Number(u.totalRecharge.toFixed(2)),
    assetsTotal: Number((userAssetsMap.get(u.id) || 0).toFixed(2)),
    joinedAt: u.createdAt,
  });

  const l1 = level1Users.map((u) => toSummary(u, 1));
  const l2 = level2Users.map((u) => toSummary(u, 2));
  const l3 = level3Users.map((u) => toSummary(u, 3));
  const all = [...l1, ...l2, ...l3];

  return {
    teamRecharge: Number(all.reduce((acc, m) => acc + m.rechargeTotal, 0).toFixed(2)),
    teamAssets: Number(all.reduce((acc, m) => acc + m.assetsTotal, 0).toFixed(2)),
    teamNumber: all.length,
    levels: {
      1: l1,
      2: l2,
      3: l3,
    },
  };
}

function creditReferralCommissions(
  db: DatabaseSchema,
  sourceUser: StoredUser,
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
        id: `rec_${crypto.randomUUID().slice(0, 8)}`,
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

export function getPublicPlansAndConfig(): { plans: InvestmentPlan[]; config: SiteConfig } {
  const db = loadDb();
  return {
    plans: db.plans,
    config: db.config,
  };
}

export function registerUser(
  phone: string,
  password: string,
  inviteCode?: string,
  deviceId?: string
): { token: string; payload: DashboardPayload } {
  const db = loadDb();
  const cleanPhone = normalizePhone(phone);
  if (cleanPhone.length < 8 || cleanPhone.length > 15) {
    throw new Error('অনুগ্রহ করে সঠিক মোবাইল নম্বর দিন।');
  }
  if (password.length < 4) {
    throw new Error('লগইন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
  }
  if (db.users.some((u) => normalizePhone(u.phone) === cleanPhone)) {
    throw new Error(
      'মাল্টিপল অ্যাকাউন্ট সনাক্ত হয়েছে! এই মোবাইল নম্বর দিয়ে আগেই নিবন্ধন করা হয়েছে। একটি নম্বর দিয়ে শুধুমাত্র একবারই নিবন্ধন করা যাবে।'
    );
  }

  let referrerId: string | null = null;
  if (inviteCode && inviteCode.trim()) {
    const normalized = inviteCode.trim().toUpperCase();
    const refUser = db.users.find((u) => u.inviteCode.toUpperCase() === normalized);
    if (!refUser) {
      throw new Error('রেফার কোডটি সঠিক নয়।');
    }
    referrerId = refUser.id;
  }

  const cleanDeviceId = (deviceId || '').trim();
  let multiAccountFlag = false;
  if (cleanDeviceId) {
    const sameDeviceUsers = db.users.filter((u) => u.deviceId && u.deviceId === cleanDeviceId);
    if (sameDeviceUsers.length > 0) {
      multiAccountFlag = true;
      for (const existing of sameDeviceUsers) {
        existing.multiAccountFlag = true;
      }
    }
  }

  const randomDigits = String(Math.floor(100000000 + Math.random() * 899999999));
  const newUserId = `usr_${crypto.randomUUID().slice(0, 8)}`;
  const newInviteCode = `FDX${randomDigits.slice(-6)}`;
  const now = new Date().toISOString();
  const welcomeBonus = Number(db.config.registrationBonus) || 150;

  const newUser: StoredUser = {
    id: newUserId,
    memberId: randomDigits,
    phone: cleanPhone,
    passwordHash: hashPassword(password),
    withdrawPasswordHash: null,
    inviteCode: newInviteCode,
    referredBy: referrerId,
    balance: welcomeBonus,
    totalRecharge: 0,
    totalWithdrawal: 0,
    lastSpinDate: null,
    blocked: false,
    deviceId: cleanDeviceId || undefined,
    multiAccountFlag,
    bankBinding: null,
    createdAt: now,
  };

  db.users.push(newUser);
  db.records.unshift({
    id: `rec_${crypto.randomUUID().slice(0, 8)}`,
    userId: newUserId,
    type: 'bonus',
    title: 'নতুন নিবন্ধন বোনাস',
    amount: welcomeBonus,
    direction: 'credit',
    status: 'সম্পন্ন',
    reference: `WELCOME-${welcomeBonus}`,
    createdAt: now,
  });

  saveDb(db);
  return {
    token: signToken(newUser.id, 'user'),
    payload: getDashboardForUser(newUser.id),
  };
}

export function loginUser(phone: string, password: string): { token: string; payload: DashboardPayload } {
  const db = loadDb();
  const cleanPhone = normalizePhone(phone);
  const user = db.users.find((u) => normalizePhone(u.phone) === cleanPhone);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error('মোবাইল নম্বর অথবা পাসওয়ার্ড ভুল হয়েছে।');
  }
  if (user.blocked) {
    throw new Error('আপনার অ্যাকাউন্টটি সাময়িকভাবে বন্ধ রয়েছে। সাপোর্টে যোগাযোগ করুন।');
  }
  return {
    token: signToken(user.id, 'user'),
    payload: getDashboardForUser(user.id),
  };
}

export function getDashboardForUser(userId: string): DashboardPayload {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    throw new Error('অ্যাকাউন্ট পাওয়া যায়নি।');
  }
  if (user.blocked) {
    throw new Error('আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে।');
  }
  const products = db.products
    .filter((p) => p.userId === userId)
    .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());
  const records = db.records
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    user: sanitizeUser(user),
    products,
    records,
    team: computeTeamOverview(db, userId),
  };
}

export function purchasePlan(userId: string, planId: string): DashboardPayload {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error('অ্যাকাউন্ট পাওয়া যায়নি।');
  if (user.blocked) throw new Error('আপনার অ্যাকাউন্টটি স্থগিত রয়েছে।');

  if (user.totalRecharge <= 0) {
    throw new Error('প্ল্যান কেনার আগে অনুগ্রহ করে ডিপোজিট (রিচার্জ) সম্পন্ন করুন। ডিপোজিট ছাড়া কোনো প্ল্যান কেনা যাবে না।');
  }

  const plan = db.plans.find((p) => p.id === planId);
  if (!plan) throw new Error('নির্বাচিত প্ল্যানটি পাওয়া যায়নি।');

  if (user.balance < plan.price) {
    throw new Error(`ব্যালেন্স অপর্যাপ্ত। প্রয়োজন ৳ ${plan.price.toFixed(0)}, আপনার ব্যালেন্স ৳ ${user.balance.toFixed(0)}।`);
  }

  const now = new Date().toISOString();
  user.balance = Number((user.balance - plan.price).toFixed(2));

  const product: UserProduct = {
    id: `prd_${crypto.randomUUID().slice(0, 8)}`,
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

  db.products.unshift(product);
  db.records.unshift({
    id: `rec_${crypto.randomUUID().slice(0, 8)}`,
    userId: user.id,
    type: 'purchase',
    title: `${plan.name} ক্রয় করা হয়েছে`,
    amount: plan.price,
    direction: 'debit',
    status: 'সম্পন্ন',
    reference: product.id.toUpperCase(),
    createdAt: now,
  });

  creditReferralCommissions(db, user, plan.price, plan.code, now);

  saveDb(db);
  return getDashboardForUser(userId);
}

export function claimProductIncome(userId: string, productId: string): DashboardPayload {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error('অ্যাকাউন্ট পাওয়া যায়নি।');

  const product = db.products.find((p) => p.id === productId && p.userId === userId);
  if (!product) throw new Error('প্ল্যানের তথ্য পাওয়া যায়নি।');
  if (product.status === 'সম্পন্ন' || product.claimedDays >= product.cycleDays) {
    throw new Error('এই প্ল্যানের সব মেয়াদের আয় সংগ্রহ করা সম্পন্ন হয়েছে।');
  }

  const now = new Date().toISOString();
  product.claimedDays += 1;
  product.totalEarned = Number((product.totalEarned + product.dailyIncome).toFixed(2));
  product.lastClaimedAt = now;
  if (product.claimedDays >= product.cycleDays) {
    product.status = 'সম্পন্ন';
  }

  user.balance = Number((user.balance + product.dailyIncome).toFixed(2));
  db.records.unshift({
    id: `rec_${crypto.randomUUID().slice(0, 8)}`,
    userId: user.id,
    type: 'income',
    title: `${product.planName} দৈনিক আয় (দিন ${product.claimedDays}/${product.cycleDays})`,
    amount: product.dailyIncome,
    direction: 'credit',
    status: 'সম্পন্ন',
    reference: product.id.toUpperCase(),
    createdAt: now,
  });

  saveDb(db);
  return getDashboardForUser(userId);
}

export function processRecharge(userId: string, amount: number, method: PaymentMethod, txid: string): DashboardPayload {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error('অ্যাকাউন্ট পাওয়া যায়নি।');
  if (user.blocked) throw new Error('আপনার অ্যাকাউন্টটি স্থগিত রয়েছে।');

  if (method !== 'বিকাশ' && method !== 'নগদ' && method !== 'রকেট') {
    throw new Error('অনুগ্রহ করে বিকাশ, নগদ অথবা রকেট নির্বাচন করুন।');
  }

  const cleanTxid = (txid || '').trim().replace(/\s+/g, '').toUpperCase();
  if (cleanTxid.length < 4) {
    throw new Error('সেন্ড মানি করার পর সঠিক ট্রানজেকশন আইডি (Transaction ID) দিন।');
  }

  const duplicateTxid = db.records.some(
    (r) =>
      r.type === 'recharge' &&
      (r.reference || '').trim().replace(/\s+/g, '').toUpperCase() === cleanTxid
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

  const cleanAmount = Number(amount.toFixed(2));
  const now = new Date().toISOString();

  db.records.unshift({
    id: `rec_${crypto.randomUUID().slice(0, 8)}`,
    userId: user.id,
    type: 'recharge',
    title: `${method} সেন্ড মানি ডিপোজিট`,
    amount: cleanAmount,
    direction: 'credit',
    status: 'অপেক্ষমাণ',
    method,
    reference: cleanTxid,
    createdAt: now,
  });

  saveDb(db);
  return getDashboardForUser(userId);
}

export function processWithdrawal(userId: string, amount: number, withdrawPassword: string): DashboardPayload {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error('অ্যাকাউন্ট পাওয়া যায়নি।');
  if (user.blocked) throw new Error('আপনার অ্যাকাউন্টটি স্থগিত রয়েছে।');

  if (user.totalRecharge <= 0) {
    throw new Error('উত্তোলন করার আগে কমপক্ষে একবার ডিপোজিট (রিচার্জ) সম্পন্ন করতে হবে।');
  }

  if (!user.bankBinding || !user.bankBinding.walletAddress) {
    throw new Error('প্রথমে "অ্যাকাউন্ট ও পাসওয়ার্ড" অপশন থেকে আপনার বিকাশ, নগদ বা রকেট নম্বর যুক্ত করুন।');
  }
  if (!user.withdrawPasswordHash) {
    throw new Error('প্রথমে একটি উত্তোলন পাসওয়ার্ড সেট করুন।');
  }
  if (!verifyPassword(withdrawPassword, user.withdrawPasswordHash)) {
    throw new Error('উত্তোলন পাসওয়ার্ড সঠিক নয়।');
  }
  const minWd = db.config.minWithdraw || 100;
  if (!Number.isFinite(amount) || amount < minWd) {
    throw new Error(`সর্বনিম্ন উত্তোলন পরিমাণ ৳ ${minWd}।`);
  }
  if (amount > user.balance) {
    throw new Error('আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই।');
  }

  const cleanAmount = Number(amount.toFixed(2));
  const now = new Date().toISOString();
  user.balance = Number((user.balance - cleanAmount).toFixed(2));
  user.totalWithdrawal = Number((user.totalWithdrawal + cleanAmount).toFixed(2));

  db.records.unshift({
    id: `rec_${crypto.randomUUID().slice(0, 8)}`,
    userId: user.id,
    type: 'withdrawal',
    title: `${user.bankBinding.network} মাধ্যমে উত্তোলন`,
    amount: cleanAmount,
    direction: 'debit',
    status: 'সম্পন্ন',
    method: user.bankBinding.network,
    reference: user.bankBinding.walletAddress,
    createdAt: now,
  });

  saveDb(db);
  return getDashboardForUser(userId);
}

export function updateBankAndSecurity(
  userId: string,
  input: {
    network: PaymentMethod;
    walletAddress: string;
    accountName: string;
    withdrawPassword?: string;
    newLoginPassword?: string;
  }
): DashboardPayload {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error('অ্যাকাউন্ট পাওয়া যায়নি।');

  if (!input.walletAddress.trim() || input.walletAddress.trim().length < 6) {
    throw new Error('অনুগ্রহ করে সঠিক বিকাশ, নগদ বা রকেট নম্বর দিন।');
  }
  if (!input.accountName.trim()) {
    throw new Error('অ্যাকাউন্ট হোল্ডারের নাম লিখুন।');
  }

  user.bankBinding = {
    network: input.network,
    walletAddress: input.walletAddress.trim(),
    accountName: input.accountName.trim(),
  };

  if (input.withdrawPassword && input.withdrawPassword.trim().length > 0) {
    if (input.withdrawPassword.trim().length < 4) {
      throw new Error('উত্তোলন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
    }
    user.withdrawPasswordHash = hashPassword(input.withdrawPassword.trim());
  }

  if (input.newLoginPassword && input.newLoginPassword.trim().length > 0) {
    if (input.newLoginPassword.trim().length < 4) {
      throw new Error('নতুন লগইন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
    }
    user.passwordHash = hashPassword(input.newLoginPassword.trim());
  }

  saveDb(db);
  return getDashboardForUser(userId);
}

export function spinLuckyWheel(userId: string): { reward: number; payload: DashboardPayload } {
  const db = loadDb();
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
    id: `rec_${crypto.randomUUID().slice(0, 8)}`,
    userId: user.id,
    type: 'bonus',
    title: 'দৈনিক লাকি হুইল বোনাস',
    amount: reward,
    direction: 'credit',
    status: 'সম্পন্ন',
    reference: `SPIN-${today}`,
    createdAt: now,
  });

  saveDb(db);
  return {
    reward,
    payload: getDashboardForUser(userId),
  };
}

// ================= ADMIN PANEL OPERATIONS =================

export function loginAdmin(username: string, password: string): { token: string; overview: AdminOverviewPayload } {
  const db = loadDb();
  if (username.trim() !== ADMIN_USERNAME || !verifyPassword(password, db.adminPasswordHash)) {
    throw new Error('এডমিন ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়।');
  }
  return {
    token: signToken(ADMIN_USERNAME, 'admin'),
    overview: getAdminOverview(),
  };
}

export function getAdminOverview(): AdminOverviewPayload {
  const db = loadDb();
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

export function adminLookupUser(query: string): AdminUserDetail {
  const db = loadDb();
  const q = query.trim();
  if (!q) {
    throw new Error('অনুগ্রহ করে সদস্যের আইডি অথবা মোবাইল নম্বর লিখুন।');
  }
  const user = db.users.find(
    (u) =>
      u.memberId === q ||
      u.phone === q ||
      u.inviteCode.toUpperCase() === q.toUpperCase() ||
      u.phone.includes(q) ||
      u.memberId.includes(q)
  );
  if (!user) {
    throw new Error(`"${q}" দিয়ে কোনো সদস্য খুঁজে পাওয়া যায়নি।`);
  }
  return {
    user: sanitizeUser(user),
    products: db.products.filter((p) => p.userId === user.id),
    records: db.records
      .filter((r) => r.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    team: computeTeamOverview(db, user.id),
  };
}

export function adminAdjustUserBalance(
  userId: string,
  operation: 'add' | 'deduct',
  amount: number,
  note?: string
): AdminUserDetail {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error('সদস্য পাওয়া যায়নি।');
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('সঠিক টাকার পরিমাণ লিখুন।');
  }

  const clean = Number(amount.toFixed(2));
  const now = new Date().toISOString();

  if (operation === 'add') {
    user.balance = Number((user.balance + clean).toFixed(2));
    db.records.unshift({
      id: `rec_${crypto.randomUUID().slice(0, 8)}`,
      userId: user.id,
      type: 'admin',
      title: note?.trim() || 'এডমিন কর্তৃক ব্যালেন্স যোগ',
      amount: clean,
      direction: 'credit',
      status: 'সম্পন্ন',
      reference: 'ADMIN-ADD',
      createdAt: now,
    });
  } else {
    if (user.balance < clean) {
      throw new Error(`সদস্যের ব্যালেন্স (৳ ${user.balance}) এর চেয়ে বেশি কাটা যাবে না।`);
    }
    user.balance = Number((user.balance - clean).toFixed(2));
    db.records.unshift({
      id: `rec_${crypto.randomUUID().slice(0, 8)}`,
      userId: user.id,
      type: 'admin',
      title: note?.trim() || 'এডমিন কর্তৃক ব্যালেন্স কর্তন',
      amount: clean,
      direction: 'debit',
      status: 'সম্পন্ন',
      reference: 'ADMIN-DEDUCT',
      createdAt: now,
    });
  }

  saveDb(db);
  return adminLookupUser(user.memberId);
}

export function adminToggleUserBlock(userId: string, blocked: boolean): AdminUserDetail {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error('সদস্য পাওয়া যায়নি।');
  user.blocked = blocked;
  saveDb(db);
  return adminLookupUser(user.memberId);
}

export function adminResolveDeposit(recordId: string, action: 'approve' | 'reject'): AdminOverviewPayload {
  const db = loadDb();
  const rec = db.records.find((r) => r.id === recordId && r.type === 'recharge');
  if (!rec) throw new Error('ডিপোজিট রেকর্ড পাওয়া যায়নি।');
  if (rec.status !== 'অপেক্ষমাণ') {
    throw new Error('এই ডিপোজিটটি ইতিমধ্যে প্রক্রিয়াকরণ হয়েছে।');
  }
  const user = db.users.find((u) => u.id === rec.userId);
  if (!user) throw new Error('সদস্য পাওয়া যায়নি।');

  if (action === 'approve') {
    rec.status = 'সম্পন্ন';
    user.balance = Number((user.balance + rec.amount).toFixed(2));
    user.totalRecharge = Number((user.totalRecharge + rec.amount).toFixed(2));
    creditReferralCommissions(db, user, rec.amount, `${rec.method || ''} ডিপোজিট`, new Date().toISOString());
  } else {
    rec.status = 'বাতিল';
  }

  saveDb(db);
  return getAdminOverview();
}

export function adminUpdateConfig(partial: Partial<SiteConfig>): AdminOverviewPayload {
  const db = loadDb();
  if (typeof partial.telegramLink === 'string' && partial.telegramLink.trim()) {
    db.config.telegramLink = partial.telegramLink.trim();
  }
  if (typeof partial.supportLink === 'string' && partial.supportLink.trim()) {
    db.config.supportLink = partial.supportLink.trim();
  }
  if (partial.rechargeNumbers) {
    db.config.rechargeNumbers = {
      বিকাশ: partial.rechargeNumbers.বিকাশ?.trim() || db.config.rechargeNumbers.বিকাশ,
      নগদ: partial.rechargeNumbers.নগদ?.trim() || db.config.rechargeNumbers.নগদ,
      রকেট: partial.rechargeNumbers.রকেট?.trim() || db.config.rechargeNumbers.রকেট,
    };
  }
  if (partial.referralRates) {
    db.config.referralRates = {
      level1: Number(partial.referralRates.level1) >= 0 ? Number(partial.referralRates.level1) : db.config.referralRates.level1,
      level2: Number(partial.referralRates.level2) >= 0 ? Number(partial.referralRates.level2) : db.config.referralRates.level2,
      level3: Number(partial.referralRates.level3) >= 0 ? Number(partial.referralRates.level3) : db.config.referralRates.level3,
    };
  }
  if (typeof partial.registrationBonus === 'number' && partial.registrationBonus >= 0) {
    db.config.registrationBonus = Number(partial.registrationBonus);
  }
  if (typeof partial.minDeposit === 'number' && partial.minDeposit > 0) {
    db.config.minDeposit = Number(partial.minDeposit);
  }
  if (typeof partial.minWithdraw === 'number' && partial.minWithdraw > 0) {
    db.config.minWithdraw = Number(partial.minWithdraw);
  }
  db.config.autoApproveDeposit = false;

  saveDb(db);
  return getAdminOverview();
}

export function adminUpdatePlan(
  planId: string,
  updates: { name?: string; price?: number; dailyIncome?: number; cycleDays?: number; totalReturn?: number }
): AdminOverviewPayload {
  const db = loadDb();
  const plan = db.plans.find((p) => p.id === planId);
  if (!plan) throw new Error('প্ল্যান পাওয়া যায়নি।');

  if (typeof updates.name === 'string' && updates.name.trim()) {
    plan.name = updates.name.trim();
  }
  if (typeof updates.price === 'number' && updates.price > 0) {
    plan.price = Number(updates.price);
  }
  if (typeof updates.dailyIncome === 'number' && updates.dailyIncome > 0) {
    plan.dailyIncome = Number(updates.dailyIncome);
  }
  if (typeof updates.cycleDays === 'number' && updates.cycleDays > 0) {
    plan.cycleDays = Math.round(updates.cycleDays);
  }
  if (typeof updates.totalReturn === 'number' && updates.totalReturn > 0) {
    plan.totalReturn = Number(updates.totalReturn);
  } else {
    plan.totalReturn = Number((plan.dailyIncome * plan.cycleDays).toFixed(2));
  }

  saveDb(db);
  return getAdminOverview();
}

export function adminChangePassword(newPassword: string): void {
  const db = loadDb();
  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('নতুন এডমিন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
  }
  db.adminPasswordHash = hashPassword(newPassword.trim());
  saveDb(db);
}
