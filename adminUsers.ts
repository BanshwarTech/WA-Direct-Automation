// Admin Users page data: every account with its plan and usage, plus a payments summary.
// Mounted under /api/admin, which registerSettingsRoutes guards (owner account, browser session only).

import type { Express } from 'express';
import { listUsersForAdmin } from './auth';
import { getUsage } from './billing';
import { isWhatsAppLinked } from './whatsapp';

const DAY = 24 * 60 * 60 * 1000;

export function registerAdminUserRoutes(app: Express) {
  app.get('/api/admin/users', (_req, res) => {
    const since = Date.now() - 30 * DAY;
    const all = listUsersForAdmin();

    const users = all
      .map((u) => {
        const usage = getUsage(u);
        const payments = u.billing?.payments ?? [];
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          createdAt: u.createdAt,
          emailVerified: u.emailVerified,
          whatsappLinked: isWhatsAppLinked(u.id),
          plan: {
            id: usage.planId,
            name: usage.planName,
            source: usage.source ?? null,
            used: usage.used,
            limit: usage.unlimited ? null : usage.limit,
            periodEnd: usage.periodEnd,
            autopay: u.billing?.subscription?.status ?? null,
          },
          paymentsCount: payments.length,
          totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
          lastPaymentAt: payments[0]?.at ?? null,
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const payments = all
      .flatMap((u) => (u.billing?.payments ?? []).map((p) => ({ ...p, userId: u.id, userName: u.name, userEmail: u.email })))
      .sort((a, b) => b.at.localeCompare(a.at));

    res.json({
      summary: {
        totalUsers: users.length,
        newUsers30d: users.filter((u) => new Date(u.createdAt).getTime() >= since).length,
        whatsappLinked: users.filter((u) => u.whatsappLinked).length,
        payingUsers: users.filter((u) => u.paymentsCount > 0).length,
        activePaidPlans: users.filter((u) => u.role !== 'owner' && u.plan.id !== 'free').length,
        activeAutopay: users.filter((u) => u.plan.autopay === 'active').length,
        totalPayments: payments.length,
        totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
        revenue30d: payments.filter((p) => new Date(p.at).getTime() >= since).reduce((sum, p) => sum + p.amount, 0),
      },
      users,
      payments: payments.slice(0, 100),
    });
  });
}
