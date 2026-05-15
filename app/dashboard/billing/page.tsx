'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/lib/store';
import { useProducts } from '@/hooks/useProducts';

import { addBill } from '@/services/billing';

import {
  updateProduct,
  getProductByBarcode,
} from '@/services/products';

import { PaymentType } from '@/types';

import {
  formatINR,
  generateInvoiceId,
} from '@/lib/utils';

import { generatePDF } from '@/lib/pdf';

export default function BillingPage() {
  const user = useAuthStore((s: any) => s.user);

  const profile: any = useAuthStore(
    (s: any) => s.profile
  );

const products: any[] = [];

  const [loading, setLoading] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [barcode, setBarcode] = useState('');

  const [paymentType, setPaymentType] =
    useState<PaymentType>('cash');

  const [items, setItems] = useState<any[]>([]);

  const addItem = (item: any) => {
    setItems((prev) => {
      const exists = prev.find(
        (x: any) => x.productId === item.productId
      );

      if (exists) {
        return prev.map((x: any) =>
          x.productId === item.productId
            ? {
                ...x,
                quantity: x.quantity + 1,
                total: (x.quantity + 1) * x.unitPrice,
              }
            : x
        );
      }

      return [...prev, item];
    });
  };

  const handleBarcode = async () => {
    if (!barcode.trim() || !user) return;

    try {
      const p = await getProductByBarcode(
        user.uid,
        barcode.trim()
      );

      if (!p) {
        toast.error('Product not found');
        return;
      }

      if (p.quantity < 1) {
        toast.error('Out of stock');
        return;
      }

      addItem({
        productId: p.id,
        productName: p.name,
        quantity: 1,
        unitPrice: p.sellingPrice,
        total: p.sellingPrice,
      });

      toast.success(p.name + ' added');

      setBarcode('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch product');
    }
  };

  const total = useMemo(() => {
    return items.reduce(
      (sum: number, item: any) => sum + item.total,
      0
    );
  }, [items]);

  const createBill = async () => {
    if (!user) return;

    if (!items.length) {
      toast.error('Add products first');
      return;
    }

    setLoading(true);

    try {
      const billId = generateInvoiceId();

      const bill: any = {
        invoiceId: billId,
        customerName,
        customerPhone,
        paymentType,
        total,
        paid: total,
        pending: 0,
        items,
        status: 'success',
      };

      await addBill(user.uid, bill);

      for (const item of items) {
        const p = products.find(
          (x: any) => x.id === item.productId
        );

        if (p) {
          await updateProduct(item.productId, {
            quantity: Math.max(
              0,
              p.quantity - item.quantity
            ),
          });
        }
      }

      const fullBill = {
        ...bill,
        id: billId,
        userId: user.uid,
        createdAt: {
          toDate: () => new Date(),
        } as any,
      };

      await generatePDF(fullBill, profile);

      console.log('Bill created');

      toast.success('Bill created successfully');

      setItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setBarcode('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">
          Billing
        </h1>

        <div className="grid gap-4">
          <input
            value={customerName}
            onChange={(e) =>
              setCustomerName(e.target.value)
            }
            placeholder="Customer Name"
            className="border rounded-xl px-4 py-3"
          />

          <input
            value={customerPhone}
            onChange={(e) =>
              setCustomerPhone(e.target.value)
            }
            placeholder="Customer Phone"
            className="border rounded-xl px-4 py-3"
          />

          <input
            value={barcode}
            onChange={(e) =>
              setBarcode(e.target.value)
            }
            placeholder="Scan Barcode"
            className="border rounded-xl px-4 py-3"
          />

          <button
            onClick={handleBarcode}
            className="bg-black text-white rounded-xl py-3"
          >
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Items
        </h2>

        <div className="space-y-3">
          {items.map((item: any) => (
            <div
              key={item.productId}
              className="flex justify-between border-b pb-2"
            >
              <div>
                <p className="font-medium">
                  {item.productName}
                </p>

                <p className="text-sm text-gray-500">
                  Qty: {item.quantity}
                </p>
              </div>

              <p className="font-semibold">
                {formatINR(item.total)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between text-lg font-bold">
          <span>Total</span>

          <span>{formatINR(total)}</span>
        </div>

        <button
          onClick={createBill}
          disabled={loading}
          className="mt-6 w-full bg-green-600 text-white rounded-xl py-3 font-semibold"
        >
          {loading ? 'Creating...' : 'Create Bill'}
        </button>
      </div>
    </div>
  );
}