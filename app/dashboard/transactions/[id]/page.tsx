'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Printer, Edit2, MessageCircle } from 'lucide-react';
import { useAuthStore, useShopStore } from '@/lib/store';
import { getBill, updateBill } from '@/services/billing';
import { Bill, PaymentStatus, PaymentType } from '@/types';
import { formatINR, buildWhatsAppLink } from '@/lib/utils';
import { generatePDF } from '@/lib/pdf';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: 'successful', label: 'Paid'      },
  { value: 'pending',    label: 'Pending'   },
  { value: 'half_paid',  label: 'Half Paid' },
  { value: 'returned',   label: 'Returned'  },
];

export default function TransactionDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const user     = useAuthStore((s) => s.user);
  const profile  = useShopStore((s) => s.profile);

  const [bill,       setBill]       = useState<Bill | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [downloading,setDownloading]= useState(false);
  const [editing,    setEditing]    = useState(false);

  // edit state
  const [editStatus,  setEditStatus]  = useState<PaymentStatus>('pending');
  const [editPayType, setEditPayType] = useState<PaymentType>('cash');
  const [editPaid,    setEditPaid]    = useState('');
  const [editNotes,   setEditNotes]   = useState('');
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    if (!user) return;
    getBill(user.uid, id).then((b) => {
      setBill(b);
      if (b) { setEditStatus(b.paymentStatus); setEditPayType(b.paymentType); setEditPaid(b.paidAmount.toString()); setEditNotes(b.notes || ''); }
      setLoading(false);
    });
  }, [user, id]);

  const handleSave = async () => {
    if (!user || !bill) return;
    setSaving(true);
    try {
      const paid      = parseFloat(editPaid) || 0;
      const remaining = Math.max(0, bill.totalAmount - paid);
      await updateBill(user.uid, bill.id, { paymentStatus: editStatus, paymentType: editPayType, paidAmount: paid, remainingAmount: remaining, notes: editNotes });
      setBill({ ...bill, paymentStatus: editStatus, paymentType: editPayType, paidAmount: paid, remainingAmount: remaining, notes: editNotes });
      toast.success('Bill updated');
      setEditing(false);
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handleDownload = async () => {
    if (!bill) return;
    setDownloading(true);
    try { await generatePDF(bill, profile); toast.success('PDF downloaded'); }
    catch { toast.error('Failed to generate PDF'); }
    finally { setDownloading(false); }
  };

  const handlePrint = async () => {
    if (!bill) return;
    await generatePDF(bill, profile);
    window.print();
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
      <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-2xl" />
    </div>
  );

  if (!bill) return (
    <div className="text-center py-20">
      <p className="text-gray-500 dark:text-slate-400">Invoice not found.</p>
      <button onClick={() => router.back()} className="mt-4 text-blue-500 text-sm font-medium">Go back</button>
    </div>
  );

  const date = bill.createdAt?.toDate ? format(bill.createdAt.toDate(), 'dd MMM yyyy, hh:mm a') : '—';
  const shopLabel = bill.shopName || profile?.shopName || 'Stockhold';

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white mb-5 text-sm font-medium">
        <ArrowLeft size={17} /> Back to Transactions
      </button>

      {/* Invoice card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden mb-4">
        {/* Blue header */}
        <div className="bg-blue-500 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/70 text-xs font-medium">{shopLabel.toUpperCase()}</p>
              <p className="text-white font-bold text-lg font-mono mt-0.5">{bill.invoiceId}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">{date}</p>
              <span className="inline-block mt-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">
                {bill.paymentStatus === 'successful' ? 'PAID' : bill.paymentStatus === 'half_paid' ? 'HALF PAID' : bill.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">Customer</p>
              <p className="font-semibold text-gray-900 dark:text-white">{bill.customerName}</p>
              {bill.customerMobile && <p className="text-sm text-gray-500 dark:text-slate-400">{bill.customerMobile}</p>}
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">Payment</p>
              <p className="font-semibold text-gray-900 dark:text-white">{bill.paymentType === 'cash' ? '💵 Cash' : '📱 Online'}</p>
            </div>
          </div>

          {/* Items table */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">Items</p>
            <div className="border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 dark:bg-slate-700/50 px-4 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                <span className="col-span-5">Product</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Rate</span>
                <span className="col-span-3 text-right">Amount</span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-slate-700">
                {bill.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 px-4 py-3 text-sm">
                    <span className="col-span-5 font-medium text-gray-800 dark:text-gray-200 truncate">{item.productName}</span>
                    <span className="col-span-2 text-center text-gray-500 dark:text-slate-400">{item.quantity}</span>
                    <span className="col-span-2 text-right text-gray-500 dark:text-slate-400">{formatINR(item.unitPrice)}</span>
                    <span className="col-span-3 text-right font-semibold text-gray-800 dark:text-gray-200">{formatINR(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400"><span>Subtotal</span><span>{formatINR(bill.subtotal)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-slate-600 pt-2"><span>Total</span><span>{formatINR(bill.totalAmount)}</span></div>
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400"><span>Paid</span><span className="font-semibold">{formatINR(bill.paidAmount)}</span></div>
            {bill.remainingAmount > 0 && <div className="flex justify-between text-sm text-red-500"><span>Remaining</span><span className="font-semibold">{formatINR(bill.remainingAmount)}</span></div>}
          </div>

          <div className="flex items-center justify-center"><StatusBadge status={bill.paymentStatus} /></div>
          {bill.notes && <p className="text-xs text-gray-400 dark:text-slate-500 italic">Note: {bill.notes}</p>}
        </div>
      </div>

      {/* Edit section */}
      {editing ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 mb-4 space-y-4">
          <p className="font-semibold text-gray-900 dark:text-white">Edit Bill</p>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-slate-400 block mb-2">Payment Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button key={s.value} onClick={() => setEditStatus(s.value)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${editStatus === s.value ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-slate-400 block mb-2">Payment Method</label>
            <div className="flex gap-2">
              {(['cash', 'online'] as PaymentType[]).map((pt) => (
                <button key={pt} onClick={() => setEditPayType(pt)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${editPayType === pt ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'}`}>
                  {pt === 'cash' ? '💵 Cash' : '📱 Online'}
                </button>
              ))}
            </div>
          </div>

          <Input label="Paid Amount (₹)" type="number" value={editPaid} onChange={(e) => setEditPaid(e.target.value)} />
          <Input label="Notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Optional notes" />

          <div className="flex gap-3">
            <Button onClick={() => setEditing(false)} variant="secondary" className="flex-1">Cancel</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">Save Changes</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setEditing(true)} variant="secondary" className="w-full mb-3 py-2.5">
          <Edit2 size={15} /> Edit Bill
        </Button>
      )}

      {/* Actions */}
      <div className="flex gap-3 mb-3">
        <Button onClick={handleDownload} loading={downloading} className="flex-1 py-3"><Download size={15} /> Download PDF</Button>
        <Button onClick={handlePrint} variant="secondary" className="flex-1 py-3"><Printer size={15} /> Print</Button>
      </div>

      {bill.customerMobile && (
        <a
          href={buildWhatsAppLink({ mobile: bill.customerMobile, invoiceId: bill.invoiceId, customerName: bill.customerName, totalAmount: bill.totalAmount, paidAmount: bill.paidAmount, remainingAmount: bill.remainingAmount, shopName: bill.shopName || profile?.shopName || 'Stockhold' })}
          target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all text-sm"
        >
          <MessageCircle size={16} /> Send on WhatsApp
        </a>
      )}
    </div>
  );
}
