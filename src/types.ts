export type PlanCategory = 'daily' | 'welfare';

export interface InvestmentPlan {
  id: string;
  code: string;
  name: string;
  category: PlanCategory;
  price: number;
  dailyIncome: number;
  cycleDays: number;
  totalReturn: number;
  imagePath: string;
}

export type PaymentMethod = 'বিকাশ' | 'নগদ' | 'রকেট';

export interface SiteConfig {
  telegramLink: string;
  supportLink: string;
  rechargeNumbers: Record<PaymentMethod, string>;
  referralRates: {
    level1: number;
    level2: number;
    level3: number;
  };
  registrationBonus: number;
  minDeposit: number;
  minWithdraw: number;
  autoApproveDeposit: boolean;
}

export type TransactionType =
  | 'recharge'
  | 'withdrawal'
  | 'purchase'
  | 'income'
  | 'commission'
  | 'bonus'
  | 'admin';

export interface AccountRecord {
  id: string;
  userId: string;
  type: TransactionType;
  title: string;
  amount: number;
  direction: 'credit' | 'debit';
  status: 'সম্পন্ন' | 'অপেক্ষমাণ' | 'বাতিল';
  method?: string;
  reference?: string;
  createdAt: string;
}

export interface UserProduct {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  category: PlanCategory;
  price: number;
  dailyIncome: number;
  cycleDays: number;
  claimedDays: number;
  totalEarned: number;
  purchasedAt: string;
  lastClaimedAt: string | null;
  status: 'সক্রিয়' | 'সম্পন্ন';
}

export interface BankBinding {
  network: PaymentMethod;
  walletAddress: string;
  accountName: string;
  hasWithdrawPassword: boolean;
}

export interface TeamMemberSummary {
  id: string;
  memberId: string;
  phoneMasked: string;
  level: 1 | 2 | 3;
  rechargeTotal: number;
  assetsTotal: number;
  joinedAt: string;
}

export interface TeamOverview {
  teamRecharge: number;
  teamAssets: number;
  teamNumber: number;
  levels: {
    1: TeamMemberSummary[];
    2: TeamMemberSummary[];
    3: TeamMemberSummary[];
  };
}

export interface UserProfile {
  id: string;
  memberId: string;
  phone: string;
  inviteCode: string;
  referredBy: string | null;
  balance: number;
  totalRecharge: number;
  totalWithdrawal: number;
  lastSpinDate: string | null;
  bankBinding: BankBinding | null;
  blocked?: boolean;
  multiAccountFlag?: boolean;
  createdAt: string;
}

export interface DashboardPayload {
  user: UserProfile;
  products: UserProduct[];
  records: AccountRecord[];
  team: TeamOverview;
}

export interface AdminUserDetail {
  user: UserProfile;
  products: UserProduct[];
  records: AccountRecord[];
  team: TeamOverview;
}

export interface AdminOverviewPayload {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  config: SiteConfig;
  plans: InvestmentPlan[];
  users: UserProfile[];
  pendingDeposits: Array<AccountRecord & { userPhone: string; memberId: string }>;
}
