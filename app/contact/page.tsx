import Link from 'next/link';
import { ArrowLeft, Mail, Globe, MessageCircle, Clock } from 'lucide-react';
export const metadata = { title: 'Contact Us – Stockhold' };
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/profile" className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white mb-8 text-sm font-medium">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4"><MessageCircle size={26} className="text-blue-500" /></div>
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-2">Contact Us</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">We're here to help. Reach out anytime.</p>
        </div>
        <div className="space-y-4 mb-6">
          {[{ icon: Mail, label: 'Email Support', value: 'karanakale011982@gmail.com', sub: 'We respond within 24 hours', href: 'mailto:karanakale011982@gmail.com', cta: 'Send Email' },
            { icon: Globe, label: 'Website', value: 'stockhold1.netlify.app', sub: 'Visit our live application', href: 'https://stockhold1.netlify.app', cta: 'Visit Site' }].map(({ icon: Icon, label, value, sub, href, cta }) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0"><Icon size={19} className="text-blue-500" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">{label}</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{value}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{sub}</p>
              </div>
              <a href={href} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-all shrink-0">{cta}</a>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5 flex items-start gap-3 mb-4">
          <Clock size={17} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Support Hours</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">We aim to respond within 24 hours on business days. For urgent issues, mention "URGENT" in your subject line.</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Founders</p>
          <div className="flex flex-col gap-2">
            {['Vedant Ghyar', 'Karan Kale'].map((name) => (
              <div key={name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center"><span className="text-white font-bold text-sm">{name[0]}</span></div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-slate-600 mt-6">Stockhold · stockhold1.netlify.app</p>
      </div>
    </div>
  );
}
