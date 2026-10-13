import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CreditCard, IndianRupee, Loader2, RefreshCw, Search, UserPlus, Users } from 'lucide-react';
import { PageShell, Highlight } from '../components/PageShell';
import { inputCls } from '../components/ui';
import { toast } from '../components/Toast';

// Mirrors the response of GET /api/admin/users (adminUsers.ts)
interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'member';
  createdAt: string;
  emailVerified: boolean;
  whatsappLinked: boolean;
  plan: { id: string; name: string; source: 'prepaid' | 'subscription' | null; used: number; limit: number | null; periodEnd: string; autopay: string | null };
  paymentsCount: number;
  totalPaid: number;
  lastPaymentAt: string | null;
}

interface Payment {
  id: string;
  planId: string;
  amount: number;
  kind: 'prepaid' | 'subscription';
  at: string;
  userName: string;
  userEmail: string;
}

interface Data {
  summary: {
    totalUsers: number;
    newUsers30d: number;
    whatsappLinked: number;
    payingUsers: number;
    activePaidPlans: number;
    activeAutopay: number;
    totalPayments: number;
    totalRevenue: number;
    revenue30d: number;
  };
  users: AdminUser[];
  payments: Payment[];
}

const card =
  'rounded-3xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(10,31,51,0.04),0_12px_32px_-12px_rgba(10,31,51,0.14)]';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const date = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const StatTile: React.FC<{ icon: React.ElementType; label: string; value: string; hint?: string }> = ({ icon: Icon, label, value, hint }) => (
  <div className={`${card} p-5`}>
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <Icon className="h-4 w-4 text-green-600" /> {label}
    </div>
    <div className="mt-2 text-2xl font-black tracking-tight text-navy-900">{value}</div>
    {hint && <div className="mt-0.5 text-xs text-slate-500">{hint}</div>}
  </div>
);

const Pill: React.FC<{ tone: 'green' | 'slate' | 'amber' | 'navy'; children: React.ReactNode }> = ({ tone, children }) => {
  const cls = {
    green: 'bg-green-50 text-green-700 ring-green-200',
    slate: 'bg-slate-100 text-slate-600 ring-slate-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    navy: 'bg-navy-900 text-white ring-navy-900',
  }[tone];
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${cls}`}>{children}</span>;
};

const th = 'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap';
const td = 'px-4 py-3 align-top';

export const UsersPage: React.FC = () => {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'paying' | 'free'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || `Could not load users (${res.status})`);
      setData(d);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const users = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.users ?? []).filter((u) => {
      if (filter === 'paying' && u.paymentsCount === 0) return false;
      if (filter === 'free' && u.paymentsCount > 0) return false;
      return !q || `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q);
    });
  }, [data, query, filter]);

  const s = data?.summary;

  return (
    <PageShell
      eyebrow="Users"
      icon={<Users className="h-3.5 w-3.5" />}
      title={<>Users & <Highlight>payments</Highlight></>}
      description="Every account on this server with its plan and usage, and who has paid."
      aside={
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-navy-900 shadow-sm hover:bg-slate-50 disabled:opacity-50 md:self-end"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      }
    >
      <div className="space-y-6">
        {!data ? (
          <div className={`${card} flex items-center gap-2 p-6 text-sm text-slate-500`}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
              </>
            ) : (
              'Could not load users.'
            )}
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile icon={Users} label="Total users" value={s!.totalUsers.toLocaleString('en-IN')} hint={`${s!.newUsers30d} new in the last 30 days`} />
              <StatTile
                icon={CheckCircle2}
                label="Paying users"
                value={s!.payingUsers.toLocaleString('en-IN')}
                hint={`${s!.activePaidPlans} on a paid plan now · ${s!.activeAutopay} on autopay`}
              />
              <StatTile icon={IndianRupee} label="Total revenue" value={inr(s!.totalRevenue)} hint={`${s!.totalPayments} payments`} />
              <StatTile icon={CreditCard} label="Last 30 days" value={inr(s!.revenue30d)} hint={`${s!.whatsappLinked} users have WhatsApp linked`} />
            </div>

            {/* Users */}
            <section className={`${card} overflow-hidden`}>
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 font-bold text-navy-900">
                  <Users className="h-4 w-4 text-green-600" /> Users
                  <span className="text-sm font-medium text-slate-400">({users.length})</span>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
                    {(['all', 'paying', 'free'] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        className={`rounded-lg px-3 py-1.5 capitalize transition ${filter === f ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-navy-900'}`}
                      >
                        {f === 'all' ? 'All' : f === 'paying' ? 'Paid' : 'Never paid'}
                      </button>
                    ))}
                  </div>
                  <div className="relative sm:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search name, email, phone"
                      className={`${inputCls} !py-2 pl-9`}
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="bg-slate-50/70">
                    <tr>
                      <th className={th}>User</th>
                      <th className={th}>Plan</th>
                      <th className={th}>Messages used</th>
                      <th className={th}>WhatsApp</th>
                      <th className={th}>Paid</th>
                      <th className={th}>Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const pct = u.plan.limit ? Math.min(100, Math.round((u.plan.used / u.plan.limit) * 100)) : 0;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60">
                          <td className={td}>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-navy-900">{u.name}</span>
                              {u.role === 'owner' && <Pill tone="navy">Admin</Pill>}
                              {!u.emailVerified && <Pill tone="amber">Email not verified</Pill>}
                            </div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                            {u.phone && <div className="text-xs text-slate-400">+{u.phone}</div>}
                          </td>
                          <td className={td}>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {u.role === 'owner' ? (
                                <span className="text-xs text-slate-500">No plan needed</span>
                              ) : (
                                <Pill tone={u.plan.id === 'free' ? 'slate' : 'green'}>{u.plan.name}</Pill>
                              )}
                              {u.plan.autopay === 'active' && <Pill tone="green">Autopay</Pill>}
                              {u.plan.source === 'prepaid' && <Pill tone="slate">Prepaid</Pill>}
                            </div>
                            {u.role !== 'owner' && <div className="mt-1 text-xs text-slate-400">Until {date(u.plan.periodEnd)}</div>}
                          </td>
                          <td className={td}>
                            {u.plan.limit === null ? (
                              <span className="text-xs text-slate-500">Unlimited</span>
                            ) : (
                              <div className="w-36">
                                <div className="text-xs text-slate-600">
                                  {u.plan.used.toLocaleString('en-IN')} / {u.plan.limit.toLocaleString('en-IN')}
                                </div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                  <div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            )}
                          </td>
                          <td className={td}>
                            {u.whatsappLinked ? <Pill tone="green">Linked</Pill> : <Pill tone="slate">Not linked</Pill>}
                          </td>
                          <td className={td}>
                            {u.paymentsCount > 0 ? (
                              <>
                                <div className="font-semibold text-navy-900">{inr(u.totalPaid)}</div>
                                <div className="text-xs text-slate-500">
                                  {u.paymentsCount} payment{u.paymentsCount === 1 ? '' : 's'}
                                  {u.lastPaymentAt ? ` · last ${date(u.lastPaymentAt)}` : ''}
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">Never paid</span>
                            )}
                          </td>
                          <td className={`${td} whitespace-nowrap text-xs text-slate-500`}>{date(u.createdAt)}</td>
                        </tr>
                      );
                    })}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                          {data.users.length === 0 ? 'No users yet.' : 'No users match this search.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Payments */}
            <section className={`${card} overflow-hidden`}>
              <div className="flex items-center gap-2 border-b border-slate-100 p-5 font-bold text-navy-900">
                <IndianRupee className="h-4 w-4 text-green-600" /> Payments
                <span className="text-sm font-medium text-slate-400">({data.summary.totalPayments})</span>
              </div>
              {data.payments.length === 0 ? (
                <div className="flex items-center gap-2 p-6 text-sm text-slate-500">
                  <UserPlus className="h-4 w-4" /> No payments yet. They appear here as soon as someone buys a plan.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-slate-50/70">
                      <tr>
                        <th className={th}>Date</th>
                        <th className={th}>User</th>
                        <th className={th}>Plan</th>
                        <th className={th}>Type</th>
                        <th className={`${th} !text-right`}>Amount</th>
                        <th className={th}>Payment id</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60">
                          <td className={`${td} whitespace-nowrap text-xs text-slate-500`}>{dateTime(p.at)}</td>
                          <td className={td}>
                            <div className="font-semibold text-navy-900">{p.userName}</div>
                            <div className="text-xs text-slate-500">{p.userEmail}</div>
                          </td>
                          <td className={`${td} capitalize`}>{p.planId}</td>
                          <td className={td}>
                            <Pill tone={p.kind === 'subscription' ? 'green' : 'slate'}>{p.kind === 'subscription' ? 'Autopay' : 'Pay once'}</Pill>
                          </td>
                          <td className={`${td} text-right font-semibold text-navy-900`}>{inr(p.amount)}</td>
                          <td className={`${td} font-mono text-xs text-slate-400`}>{p.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </PageShell>
  );
};
