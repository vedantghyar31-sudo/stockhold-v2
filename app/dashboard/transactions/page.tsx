'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, FileText, ChevronRight, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore, useShopStore } from '@/lib/store';
import { getBills } from '@/services/billing';
import { Bill, PaymentStatus } from '@/types';
import { formatINR } from '@/lib/utils';
import { generatePDF } from '@/lib/pdf';
import { StatusBadge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/Card';
import { SubscriptionGate } from '@/components/billing/SubscriptionGate';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ALL_STATUSES: PaymentStatus[] = ['successful', 'pending', 'half_paid', 'returned'];

export default function TransactionsPage() {
  return <SubscriptionGate feature="Transaction History"><TransactionsContent /></SubscriptionGate>;
}

function TransactionsContent() {
  const user    = useAuthStore((s) => s.user);
  const profile = useShopStore((s) => s.profile);
  const router  = useRouter();

  const [bills,         setBills]         = useState<Bill[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState<PaymentStatus | 'all'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getBills(user.uid).then((b) => { setBills(b); setLoading(false); });
  }, [user]);

  const filtered = useMemo(() => bills.filter((b) => {
    const matchSearch = !search.trim() ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.invoiceId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  }), [bills, search, statusFilter]);

  const stats = useMemo(() => ({
    total:      filtered.length,
    totalAmt:   filtered.reduce((s, b) => s + b.totalAmount,    0),
    collected:  filtered.reduce((s, b) => s + b.paidAmount,     0),
    pending:    filtered.reduce((s, b) => s + b.remainingAmount, 0),
    paidBills:  filtered.filter((b) => b.paymentStatus === 'successful').length,
    pendingBills: filtered.filter((b) => b.paymentStatus !== 'successful').length,
  }), [filtered]);

  const handleDownload = async (e: React.MouseEvent, bill: Bill) => {
    e.stopPropagation();
    setDownloadingId(bill.id);
    try { await generatePDF(bill, profile); toast.success('PDF downloaded'); }
    catch { toast.error('Failed to generate PDF'); }
    finally { setDownloadingId(null); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Transactions</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Full billing & payment history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard icon={FileText}    label="Total Bills"      value={`${stats.total}`}            color="bg-blue-500"    />
        <StatCard icon={DollarSign}  label="Total Amount"     value={formatINR(stats.totalAmt)}   color="bg-violet-500"  />
        <StatCard icon={CheckCircle} label="Collected"        value={formatINR(stats.collected)}  color="bg-green-500"   />
        <StatCard icon={AlertCircle} label="Pending Amount"   value={formatINR(stats.pending)}    color="bg-red-500"     />
        <StatCard icon={CheckCircle} label="Paid Bills"       value={`${stats.paidBills}`}        color="bg-emerald-500" />
        <StatCard icon={Clock}       label="Pending Bills"    value={`${stats.pendingBills}`}     color="bg-orange-500"  />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by customer or invoice ID..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', ...ALL_STATUSES] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                statusFilter === s
                  ? s === 'all' ? 'bg-gray-800 dark:bg-white text-white dark:text-gray-900 border-transparent'
                    : 'bg-blue-500 text-white border-transparent'
                  : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}>
              {s === 'all' ? 'All' : s === 'successful' ? 'Paid' : s === 'half_paid' ? 'Half Paid' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
          <FileText size={36} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((bill) => {
            const date = bill.createdAt?.toDate ? format(bill.createdAt.toDate(), 'dd MMM yyyy, hh:mm a') : '—';
            return (
              <div key={bill.id} onClick={() => router.push(`/dashboard/transactions/${bill.id}`)}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <FileText size={17} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{bill.customerName}</p>
                    <StatusBadge status={bill.paymentStatus} />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 font-mono">{bill.invoiceId}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{date} · {bill.paymentType === 'cash' ? '💵 Cash' : '📱 Online'}</p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{formatINR(bill.totalAmount)}</p>
                    {bill.remainingAmount > 0 && <p className="text-xs text-red-500">Due: {formatINR(bill.remainingAmount)}</p>}
                  </div>
                  <button onClick={(e) => handleDownload(e, bill)} disabled={downloadingId === bill.id}
                    className="w-8 h-8 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50">
                    {downloadingId === bill.id
                      ? <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                      : <Download size={13} />}
                  </button>
                  <ChevronRight size={15} className="text-gray-300 dark:text-slate-600" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
