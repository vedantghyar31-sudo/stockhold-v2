'use client';
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, FileText, CheckCircle, Clock, AlertCircle, RotateCcw, ShoppingBag, BarChart2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { getAnalytics } from '@/services/analytics';
import { AnalyticsSummary, TimeFilter } from '@/types';
import { formatINR } from '@/lib/utils';
import { StatCard } from '@/components/ui/Card';
import { SubscriptionGate } from '@/components/billing/SubscriptionGate';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const FILTERS: { label: string; value: TimeFilter }[] = [
  { label: 'Today',        value: 'today' },
  { label: 'This Week',    value: 'week'  },
  { label: 'Last 30 Days', value: 'month' },
  { label: 'This Year',    value: 'year'  },
];

export default function AnalyticsPage() {
  return <SubscriptionGate feature="Analytics"><AnalyticsContent /></SubscriptionGate>;
}

function AnalyticsContent() {
  const user = useAuthStore((s) => s.user);
  const [filter,  setFilter]  = useState<TimeFilter>('month');
  const [data,    setData]    = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getAnalytics(user.uid, filter).then((d) => { setData(d); setLoading(false); });
  }, [user, filter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Revenue and billing insights</p>
      </div>

      {/* Time filters */}
      <div className="flex gap-1.5 mb-6 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 w-fit flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.value ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array(8).fill(0).map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}</div>
          <div className="h-64 skeleton rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Revenue */}
          <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">Revenue & Profit</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard icon={DollarSign}  label="Total Revenue"    value={formatINR(data?.totalRevenue    || 0)} color="bg-blue-500"    />
            <StatCard icon={TrendingUp}  label="Total Collected"  value={formatINR(data?.totalProfit     || 0)} color="bg-green-500"   />
            <StatCard icon={DollarSign}  label="Collected Amt"    value={formatINR(data?.collectedAmount || 0)} color="bg-emerald-500" />
            <StatCard icon={AlertCircle} label="Pending Amt"      value={formatINR(data?.pendingAmount   || 0)} color="bg-red-500"     />
          </div>

          {/* Bills */}
          <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">Billing Breakdown</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <StatCard icon={FileText}    label="Total Bills"    value={`${data?.totalBills    || 0}`} color="bg-violet-500" />
            <StatCard icon={CheckCircle} label="Paid Bills"     value={`${data?.paidBills     || 0}`} color="bg-green-500"  />
            <StatCard icon={Clock}       label="Pending Bills"  value={`${data?.pendingBills  || 0}`} color="bg-yellow-500" />
            <StatCard icon={ShoppingBag} label="Half Paid"      value={`${data?.halfPaidBills || 0}`} color="bg-orange-500" />
            <StatCard icon={RotateCcw}   label="Returned"       value={`${data?.returnedBills || 0}`} color="bg-red-500"    />
          </div>

          {/* Charts */}
          {[
            { key: 'revenue', label: 'Revenue', stroke: '#3b82f6', grad: 'revGrad', stop: '#3b82f6' },
            { key: 'profit',  label: 'Profit',  stroke: '#22c55e', grad: 'profGrad',stop: '#22c55e' },
          ].map(({ key, label, stroke, grad, stop }) => (
            <div key={key} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{FILTERS.find((f) => f.value === filter)?.label}</p>
                </div>
                <BarChart2 size={17} className="text-gray-300 dark:text-slate-600" />
              </div>
              {data && data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={data.chartData}>
                    <defs>
                      <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={stop} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={stop} stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v: number) => [formatINR(v), label]} />
                    <Area type="monotone" dataKey={key} stroke={stroke} strokeWidth={2} fill={`url(#${grad})`} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-44 flex items-center justify-center text-gray-400 dark:text-slate-600 text-sm">No data for this period</div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
