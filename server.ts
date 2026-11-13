import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import {
  adminAdjustUserBalance,
  adminChangePassword,
  adminLookupUser,
  adminResolveDeposit,
  adminToggleUserBlock,
  adminUpdateConfig,
  adminUpdatePlan,
  claimProductIncome,
  getAdminOverview,
  getDashboardForUser,
  getPublicPlansAndConfig,
  loginAdmin,
  loginUser,
  processRecharge,
  processWithdrawal,
  purchasePlan,
  registerUser,
  spinLuckyWheel,
  updateBankAndSecurity,
  verifyToken,
} from './server/store';
import type { PaymentMethod, SiteConfig } from './src/types';

interface AuthedRequest extends Request {
  userId?: string;
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'অনুগ্রহ করে আগে লগইন করুন।' });
    return;
  }
  const token = header.slice(7).trim();
  const userId = verifyToken(token, 'user');
  if (!userId) {
    res.status(401).json({ error: 'আপনার সেশন মেয়াদ শেষ হয়েছে। অনুগ্রহ করে পুনরায় লগইন করুন।' });
    return;
  }
  req.userId = userId;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'এডমিন অথেনটিকেশন প্রয়োজন।' });
    return;
  }
  const token = header.slice(7).trim();
  const adminId = verifyToken(token, 'admin');
  if (!adminId) {
    res.status(403).json({ error: 'অননুমোদিত প্রবেশ! শুধুমাত্র এডমিন প্রবেশ করতে পারবেন।' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'FeedexDigital' });
  });

  app.get('/api/plans', (_req, res) => {
    const data = getPublicPlansAndConfig();
    res.json(data);
  });

  app.post('/api/auth/register', (req, res) => {
    try {
      const { phone, password, inviteCode } = req.body as {
        phone?: string;
        password?: string;
        inviteCode?: string;
      };
      if (!phone || !password) {
        res.status(400).json({ error: 'মোবাইল নম্বর এবং পাসওয়ার্ড দেওয়া আবশ্যক।' });
        return;
      }
      const deviceId =
        (typeof req.headers['x-client-id'] === 'string' ? req.headers['x-client-id'] : '') ||
        req.ip ||
        '';
      const result = registerUser(phone, password, inviteCode, deviceId);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'নিবন্ধন ব্যর্থ হয়েছে।' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { phone, password } = req.body as { phone?: string; password?: string };
      if (!phone || !password) {
        res.status(400).json({ error: 'মোবাইল নম্বর এবং পাসওয়ার্ড দেওয়া আবশ্যক।' });
        return;
      }
      const result = loginUser(phone, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : 'লগইন ব্যর্থ হয়েছে।' });
    }
  });

  app.get('/api/me', requireAuth, (req: AuthedRequest, res) => {
    try {
      const payload = getDashboardForUser(req.userId!);
      res.json({ payload });
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'অ্যাকাউন্ট পাওয়া যায়নি।' });
    }
  });

  app.post('/api/products/buy', requireAuth, (req: AuthedRequest, res) => {
    try {
      const { planId } = req.body as { planId?: string };
      if (!planId) {
        res.status(400).json({ error: 'প্ল্যান আইডি প্রয়োজন।' });
        return;
      }
      const payload = purchasePlan(req.userId!, planId);
      res.json({ payload });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'প্ল্যান কেনা সম্পন্ন হয়নি।' });
    }
  });

  app.post('/api/products/claim', requireAuth, (req: AuthedRequest, res) => {
    try {
      const { productId } = req.body as { productId?: string };
      if (!productId) {
        res.status(400).json({ error: 'পণ্য আইডি প্রয়োজন।' });
        return;
      }
      const payload = claimProductIncome(req.userId!, productId);
      res.json({ payload });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'দৈনিক আয় সংগ্রহ ব্যর্থ হয়েছে।' });
    }
  });

  app.post('/api/recharge', requireAuth, (req: AuthedRequest, res) => {
    try {
      const { amount, method, txid } = req.body as {
        amount?: number;
        method?: PaymentMethod;
        txid?: string;
      };
      if (typeof amount !== 'number' || !method || !txid) {
        res.status(400).json({ error: 'টাকার পরিমাণ, পেমেন্ট মাধ্যম এবং ট্রানজেকশন আইডি দিন।' });
        return;
      }
      const payload = processRecharge(req.userId!, amount, method, txid);
      res.json({ payload });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'ডিপোজিট ব্যর্থ হয়েছে।' });
    }
  });

  app.post('/api/withdraw', requireAuth, (req: AuthedRequest, res) => {
    try {
      const { amount, withdrawPassword } = req.body as {
        amount?: number;
        withdrawPassword?: string;
      };
      if (typeof amount !== 'number' || !withdrawPassword) {
        res.status(400).json({ error: 'উত্তোলনের পরিমাণ এবং পাসওয়ার্ড দিন।' });
        return;
      }
      const payload = processWithdrawal(req.userId!, amount, withdrawPassword);
      res.json({ payload });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'উত্তোলন ব্যর্থ হয়েছে।' });
    }
  });

  app.post('/api/bank-card', requireAuth, (req: AuthedRequest, res) => {
    try {
      const { network, walletAddress, accountName, withdrawPassword, newLoginPassword } = req.body as {
        network?: PaymentMethod;
        walletAddress?: string;
        accountName?: string;
        withdrawPassword?: string;
        newLoginPassword?: string;
      };
      if (!network || !walletAddress || !accountName) {
        res.status(400).json({ error: 'মাধ্যম, মোবাইল নম্বর এবং অ্যাকাউন্ট হোল্ডারের নাম দিন।' });
        return;
      }
      const payload = updateBankAndSecurity(req.userId!, {
        network,
        walletAddress,
        accountName,
        withdrawPassword,
        newLoginPassword,
      });
      res.json({ payload });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'তথ্য সংরক্ষণ ব্যর্থ হয়েছে।' });
    }
  });

  app.post('/api/spin', requireAuth, (req: AuthedRequest, res) => {
    try {
      const result = spinLuckyWheel(req.userId!);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'স্পিন সম্পন্ন হয়নি।' });
    }
  });

  // ================= SECURE ADMIN ROUTES =================

  app.post('/api/admin/login', (req, res) => {
    try {
      const { username, password } = req.body as { username?: string; password?: string };
      if (!username || !password) {
        res.status(400).json({ error: 'এডমিন ইউজারনেম এবং পাসওয়ার্ড দিন।' });
        return;
      }
      const result = loginAdmin(username, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : 'এডমিন লগইন ব্যর্থ হয়েছে।' });
    }
  });

  app.get('/api/admin/overview', requireAdmin, (_req, res) => {
    res.json({ overview: getAdminOverview() });
  });

  app.get('/api/admin/user-lookup', requireAdmin, (req, res) => {
    try {
      const query = typeof req.query.q === 'string' ? req.query.q : '';
      const detail = adminLookupUser(query);
      res.json({ detail });
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'সদস্য পাওয়া যায়নি।' });
    }
  });

  app.post('/api/admin/user-balance', requireAdmin, (req, res) => {
    try {
      const { userId, operation, amount, note } = req.body as {
        userId?: string;
        operation?: 'add' | 'deduct';
        amount?: number;
        note?: string;
      };
      if (!userId || (operation !== 'add' && operation !== 'deduct') || typeof amount !== 'number') {
        res.status(400).json({ error: 'সদস্য, ধরন এবং টাকার পরিমাণ সঠিকভাবে দিন।' });
        return;
      }
      const detail = adminAdjustUserBalance(userId, operation, amount, note);
      res.json({ detail, overview: getAdminOverview() });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'ব্যালেন্স পরিবর্তন ব্যর্থ হয়েছে।' });
    }
  });

  app.post('/api/admin/user-block', requireAdmin, (req, res) => {
    try {
      const { userId, blocked } = req.body as { userId?: string; blocked?: boolean };
      if (!userId || typeof blocked !== 'boolean') {
        res.status(400).json({ error: 'অবৈধ অনুরোধ।' });
        return;
      }
      const detail = adminToggleUserBlock(userId, blocked);
      res.json({ detail, overview: getAdminOverview() });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'ব্যর্থ হয়েছে।' });
    }
  });

  app.post('/api/admin/deposit-resolve', requireAdmin, (req, res) => {
    try {
      const { recordId, action } = req.body as { recordId?: string; action?: 'approve' | 'reject' };
      if (!recordId || (action !== 'approve' && action !== 'reject')) {
        res.status(400).json({ error: 'অবৈধ ডিপোজিট অনুরোধ।' });
        return;
      }
      const overview = adminResolveDeposit(recordId, action);
      res.json({ overview });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'ডিপোজিট প্রক্রিয়াকরণ ব্যর্থ হয়েছে।' });
    }
  });

  app.post('/api/admin/config', requireAdmin, (req, res) => {
    try {
      const overview = adminUpdateConfig(req.body as Partial<SiteConfig>);
      res.json({ overview });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।' });
    }
  });

  app.post('/api/admin/plan', requireAdmin, (req, res) => {
    try {
      const { planId, name, price, dailyIncome, cycleDays, totalReturn } = req.body as {
        planId?: string;
        name?: string;
        price?: number;
        dailyIncome?: number;
        cycleDays?: number;
        totalReturn?: number;
      };
      if (!planId) {
        res.status(400).json({ error: 'প্ল্যান আইডি প্রয়োজন।' });
        return;
      }
      const overview = adminUpdatePlan(planId, { name, price, dailyIncome, cycleDays, totalReturn });
      res.json({ overview });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'প্ল্যান আপডেট ব্যর্থ হয়েছে।' });
    }
  });

  app.post('/api/admin/password', requireAdmin, (req, res) => {
    try {
      const { newPassword } = req.body as { newPassword?: string };
      if (!newPassword) {
        res.status(400).json({ error: 'নতুন পাসওয়ার্ড দিন।' });
        return;
      }
      adminChangePassword(newPassword);
      res.json({ ok: true });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'পাসওয়ার্ড পরিবর্তন ব্যর্থ।' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`FeedexDigital server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
