import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatINR = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

export const generateInvoiceId = (): string => {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `INV-${ts}-${rnd}`;
};

export const buildWhatsAppLink = (params: {
  mobile:          string;
  invoiceId:       string;
  customerName:    string;
  totalAmount:     number;
  paidAmount:      number;
  remainingAmount: number;
  shopName:        string;
}): string => {
  const { mobile, invoiceId, customerName, totalAmount, paidAmount, remainingAmount, shopName } = params;
  const msg = encodeURIComponent(
    `*${shopName} – Invoice*\n\n` +
    `Hello ${customerName},\n\n` +
    `Invoice No : *${invoiceId}*\n` +
    `Total      : *${formatINR(totalAmount)}*\n` +
    `Paid       : *${formatINR(paidAmount)}*\n` +
    (remainingAmount > 0 ? `Balance    : *${formatINR(remainingAmount)}*\n` : `Status     : *Fully Paid ✅*\n`) +
    `\nThank you for your business! 🙏`
  );
  const phone = mobile.replace(/\D/g, '');
  const num   = phone.startsWith('91') ? phone : `91${phone}`;
  return `https://wa.me/${num}?text=${msg}`;
};
