'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Trash2, Plus, Minus, ShoppingCart, FileText, X, ArrowRight, Package, ScanLine, MessageCircle } from 'lucide-react';
import { useAuthStore, useCartStore, useShopStore } from '@/lib/store';
import { useProducts } from '@/hooks/useProducts';
import { addBill } from '@/services/billing';
import { updateProduct, getProductByBarcode } from '@/services/products';
import { Bill, PaymentType } from '@/types';
import { formatINR, generateInvoiceId, buildWhatsAppLink } from '@/lib/utils';
import { generatePDF } from '@/lib/pdf';
import { BarcodeScanner } from '@/components/barcode/BarcodeScanner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SubscriptionGate } from '@/components/billing/SubscriptionGate';
import toast from 'react-hot-toast';

type Step = 'cart' | 'checkout';

export default function BillingPage() {
  return (
    <SubscriptionGate feature="Billing">
      <BillingContent />
    </SubscriptionGate>
  );
}

function BillingContent() {
  const user    = useAuthStore((s) => s.user);
  const profile = useShopStore((s) => s.profile);
  const router  = useRouter();
  const { products } = useProducts(user?.uid);
  const { items, addItem, updateQty, removeItem, clearCart, total } = useCartStore();

  const [step,           setStep]           = useState<Step>('cart');
  const [search,         setSearch]         = useState('');
  const [showScanner,    setShowScanner]    = useState(false);
  const [customerName,   setCustomerName]   = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [paymentType,    setPaymentType]    = useState<PaymentType>('cash');
  const [paidAmount,     setPaidAmount]     = useState('');
  const [notes,          setNotes]          = useState('');
  const [saving,         setSaving]         = useState(false);
  const [lastBill,       setLastBill]       = useState<Bill | null>(null);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.barcode?.includes(q)).slice(0, 16);
  }, [products, search]);

  const subtotal  = total();
  const paid      = parseFloat(paidAmount) || 0;
  const remaining = Math.max(0, subtotal - paid);
  const status    = paid === 0 ? 'pending' : paid >= subtotal ? 'successful' : 'half_paid';

  const handleBarcodeScanned = async (code: string) => {
    setShowScanner(false);
    if (!user) return;
    const p = await getProductByBarcode(user.uid, code);
    if (!p) { toast.error('Product not found'); return; }
    if (p.quantity < 1) { toast.error('Out of stock'); return; }
    addItem({ productId: p.id, productName: p.name, quantity: 1, unitPrice: p.sellingPrice, total: p.sellingPrice });
    toast.success(`${p.name} added`);
  };

  const handleCheckout = async () => {
    if (!user) return;
    if (items.length === 0)   { toast.error('Add at least one product'); return; }
    if (!customerName.trim()) { toast.error('Enter customer name');       return; }
    setSaving(true);
    try {
      const invoiceId = generateInvoiceId();
      const bill: Omit<Bill, 'id' | 'createdAt' | 'userId'> = {
        invoiceId,
        shopName:        profile?.shopName    || '',
        shopAddress:     profile?.shopAddress || '',
        shopPhone:       profile?.shopPhone   || '',
        shopLogo:        profile?.shopLogo    || '',
        customerName:    customerName.trim(),
        customerMobile:  customerMobile.trim(),
        items,
        subtotal,
        totalAmount:     subtotal,
        paidAmount:      paid,
        remainingAmount: remaining,
        paymentType,
        paymentStatus:   status as any,
        notes,
      };
      const billId = await addBill(user.uid, bill);
      // reduce stock
      for (const item of items) {
        const p = products.find((x) => x.id === item.productId);
        if (p) await updateProduct(user.uid, item.productId, { quantity: Math.max(0, p.quantity - item.quantity) });
      }
      const fullBill = { ...bill, id: billId, userId: user.uid, createdAt: { toDate: () => new Date() } as any };
      await generatePDF(fullBill, profile);
      setLastBill(fullBill as Bill);
      toast.success('Invoice created & PDF downloaded!');
      clearCart(); setCustomerName(''); setCustomerMobile(''); setPaidAmount(''); setNotes('');
      setStep('cart');
    } catch (e) { console.error(e); toast.error('Failed to create bill'); }
    finally { setSaving(false); }
  };

  // ── STEP 1: Cart ─────────────────────────────────────────────────────────
  if (step === 'cart') return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Billing</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Search and add products</p>
        </div>
        {items.length > 0 && (
          <span className="w-7 h-7 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{items.length}</span>
        )}
      </div>

      {/* Search + Scan */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or barcode..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>
        <button onClick={() => setShowScanner(true)}
          className="px-3.5 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
          <ScanLine size={18} className="text-blue-500" />
        </button>
      </div>

      {/* Search results */}
      {search.trim() ? (
        filteredProducts.length === 0
          ? <div className="text-center py-8 text-gray-400 dark:text-slate-600 text-sm mb-4">No products found</div>
          : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {filteredProducts.map((p) => (
                <button key={p.id}
                  onClick={() => {
                    if (p.quantity < 1) { toast.error('Out of stock'); return; }
                    addItem({ productId: p.id, productName: p.name, quantity: 1, unitPrice: p.sellingPrice, total: p.sellingPrice });
                    toast.success(`${p.name} added`);
                  }}
                  className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 text-left hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
                >
                  <div className="w-full h-20 bg-gray-50 dark:bg-slate-700 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                    {p.imageUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      : <Package size={18} className="text-gray-300 dark:text-slate-600" />}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">{p.name}</p>
                  <p className="text-xs text-blue-500 font-bold mt-0.5">{formatINR(p.sellingPrice)}</p>
                  <p className={`text-xs mt-0.5 ${p.quantity < 5 ? 'text-red-400' : 'text-gray-400 dark:text-slate-500'}`}>{p.quantity} left</p>
                </button>
              ))}
            </div>
          )
      ) : (
        <div className="text-center py-10 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 mb-6">
          <Search size={24} className="text-gray-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-gray-400 dark:text-slate-500 text-sm">Type a product name or scan a barcode to add items</p>
        </div>
      )}

      {/* Cart */}
      {items.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm mb-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <ShoppingCart size={15} className="text-blue-500" />
              <span className="font-semibold text-sm text-gray-900 dark:text-white">Cart ({items.length})</span>
            </div>
            <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
              <X size={11} /> Clear
            </button>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-slate-700">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{formatINR(item.unitPrice)} each</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-6 h-6 rounded-lg border border-gray-200 dark:border-slate-600 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"><Minus size={10} /></button>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-6 h-6 rounded-lg border border-gray-200 dark:border-slate-600 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"><Plus size={10} /></button>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{formatINR(item.total)}</p>
                  <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
            <span className="font-bold text-gray-900 dark:text-white text-sm">Subtotal</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{formatINR(subtotal)}</span>
          </div>
        </div>
      )}

      {/* WhatsApp button for last bill */}
      {lastBill && lastBill.customerMobile && (
        <a
          href={buildWhatsAppLink({ mobile: lastBill.customerMobile, invoiceId: lastBill.invoiceId, customerName: lastBill.customerName, totalAmount: lastBill.totalAmount, paidAmount: lastBill.paidAmount, remainingAmount: lastBill.remainingAmount, shopName: profile?.shopName || 'Stockhold' })}
          target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3 mb-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all text-sm"
        >
          <MessageCircle size={16} /> Send Last Invoice on WhatsApp
        </a>
      )}

      <Button onClick={() => setStep('checkout')} disabled={items.length === 0} className="w-full py-3.5">
        Generate Bill <ArrowRight size={17} />
      </Button>

      {showScanner && <BarcodeScanner onScanned={handleBarcodeScanned} onClose={() => setShowScanner(false)} />}
    </div>
  );

  // ── STEP 2: Checkout ─────────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto">
      <button onClick={() => setStep('cart')} className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white mb-5 text-sm font-medium">
        ← Back to Cart
      </button>
      <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-5">Customer & Payment</h2>

      {/* Order summary */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 mb-5 border border-gray-100 dark:border-slate-700">
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">Order Summary</p>
        <div className="space-y-1.5 text-sm mb-3">
          {items.map((i) => (
            <div key={i.productId} className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>{i.productName} × {i.quantity}</span>
              <span className="font-medium">{formatINR(i.total)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-slate-700 pt-2">
          <span>Total</span><span>{formatINR(subtotal)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Input label="Customer Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" />
        <Input label="Mobile Number"   value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} placeholder="+91 98765 43210" type="tel" />

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">Payment Method</label>
          <div className="flex gap-2">
            {(['cash', 'online'] as PaymentType[]).map((pt) => (
              <button key={pt} onClick={() => setPaymentType(pt)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${paymentType === pt ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                {pt === 'cash' ? '💵 Cash' : '📱 Online'}
              </button>
            ))}
          </div>
        </div>

        <Input label="Paid Amount" prefix="₹" type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder={`of ${formatINR(subtotal)}`} />

        {paidAmount && (
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3 space-y-1.5 text-sm border border-gray-100 dark:border-slate-700">
            <div className="flex justify-between text-gray-500 dark:text-slate-400"><span>Paid</span><span className="font-semibold text-green-600 dark:text-green-400">{formatINR(paid)}</span></div>
            <div className="flex justify-between text-gray-500 dark:text-slate-400"><span>Remaining</span><span className={`font-semibold ${remaining > 0 ? 'text-red-500' : 'text-green-500'}`}>{remaining > 0 ? formatINR(remaining) : 'Fully Paid'}</span></div>
            <div className="flex justify-between text-gray-500 dark:text-slate-400"><span>Status</span><span className="font-semibold capitalize">{status.replace('_', ' ')}</span></div>
          </div>
        )}

        <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note..." />

        <Button onClick={handleCheckout} loading={saving} className="w-full py-3.5 mt-1">
          <FileText size={16} /> Confirm & Download Invoice
        </Button>

        {customerMobile && lastBill && (
          <a
            href={buildWhatsAppLink({ mobile: customerMobile, invoiceId: lastBill?.invoiceId || '', customerName, totalAmount: subtotal, paidAmount: paid, remainingAmount: remaining, shopName: profile?.shopName || 'Stockhold' })}
            target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all text-sm"
          >
            <MessageCircle size={16} /> Send on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
