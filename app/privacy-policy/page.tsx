import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
export const metadata = { title: 'Privacy Policy – Stockhold' };

const SECTIONS = [
  { title: '1. Information We Collect', content: 'We collect: Account Information (name, email, Firebase Authentication details, Google Sign-In info); Business & Inventory Data (product names, images, pricing, stock, barcode info, billing records, customer names/mobiles); Payment Information (processed via Razorpay — we never store card or banking details); Technical Information (device type, browser, IP address, usage logs).' },
  { title: '2. How We Use Your Information', content: 'We use data to: provide inventory management services, store and manage product data, generate invoices and receipts, process subscription payments, improve app performance, authenticate users securely, and prevent unauthorized access.' },
  { title: '3. Data Storage & Security', content: 'Stockhold uses Firebase Authentication, Firebase Firestore, Firebase Storage, Razorpay, and Netlify. We take reasonable measures to protect your data. No internet platform can guarantee complete security.' },
  { title: '4. User Data Ownership', content: 'All inventory, invoice, billing, and transaction data belongs to the account owner. Users are responsible for maintaining account security and credential protection.' },
  { title: '5. OCR & Barcode Scanning', content: 'Scan features are used only to identify products within your own inventory. Uploaded scan data is never sold or shared for advertising purposes.' },
  { title: '6. Subscription & Payments', content: 'Certain features require an active paid subscription at ₹2,000/month. Payments are handled securely via Razorpay. Stockhold does not store sensitive payment information.' },
  { title: '7. Cookies & Local Storage', content: 'We use cookies, localStorage, and sessionStorage to: maintain login sessions, remember preferences, improve experience, and store theme settings (dark mode).' },
  { title: '8. Data Retention', content: 'User data remains stored while the account is active. Some data may temporarily remain in backups or logs for security and operational purposes.' },
  { title: "9. Children's Privacy", content: 'Stockhold is not intended for users under 13. We do not knowingly collect personal information from children.' },
  { title: '10. Limitation of Liability', content: 'Stockhold is provided "as is." We are not responsible for business losses, incorrect inventory records, user-entered billing mistakes, third-party service downtime, or accidental data loss. Users are responsible for verifying invoice accuracy.' },
  { title: '11. Changes to This Policy', content: 'We may update this Privacy Policy occasionally. Changes are effective once posted. Continued use means you accept the revised policy.' },
  { title: '12. Contact', content: 'For questions: Stockhold Support · Founders: Vedant Ghyar & Karan Kale · Website: stockhold1.netlify.app · Email: karanakale011982@gmail.com' },
  { title: '13. Consent', content: 'By using Stockhold, you consent to this Privacy Policy and agree to its terms.' },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard/profile" className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white mb-8 text-sm font-medium">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center"><span className="text-white font-bold text-lg">S</span></div>
            <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Privacy Policy</h1>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-8">Last Updated: August 2026</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
            Welcome to Stockhold. This Privacy Policy explains how Stockhold collects, uses, stores, and protects your information. By using Stockhold, you agree to the practices described here.
          </p>
          <div className="space-y-6">
            {SECTIONS.map(({ title, content }) => (
              <div key={title}>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
