import Link from 'next/link';
import { ArrowLeft, Package, Target, Zap, Users } from 'lucide-react';
export const metadata = { title: 'About Us – Stockhold' };
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard/profile" className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white mb-8 text-sm font-medium">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white text-center mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><Package size={28} className="text-white" /></div>
          <h1 className="text-3xl font-bold font-display mb-2">About Stockhold</h1>
          <p className="text-white/80 text-sm max-w-md mx-auto">Smart, modern inventory management for Indian shop owners.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-3">Our Story</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">Stockhold was born from a simple observation — small shop owners across India spend hours manually tracking inventory, writing bills on paper, and struggling with complicated software that wasn't built for their needs.</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">We built Stockhold to change that. A clean, mobile-first platform that lets any shop owner manage products, generate professional invoices, share them on WhatsApp, and understand their business — all from their phone.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[{ icon: Target, title: 'Mission', desc: 'Empower every Indian shop owner with professional inventory and billing tools at an affordable price.' },
            { icon: Zap, title: 'Vision', desc: 'A world where every small business has access to the same tools as large enterprises.' },
            { icon: Users, title: 'Who We Serve', desc: 'Small and medium retailers, shop owners, and entrepreneurs across India.' }].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-3"><Icon size={17} className="text-blue-500" /></div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{title}</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-5">Meet the Founders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{ name: 'Vedant Ghyar', role: 'Co-Founder', initial: 'V', bio: 'Passionate about building practical tools that help small business owners manage their operations efficiently.' },
              { name: 'Karan Kale',   role: 'Co-Founder', initial: 'K', bio: 'Focused on creating seamless user experiences and reliable software for everyday business needs.' }].map(({ name, role, initial, bio }) => (
              <div key={name} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shrink-0"><span className="text-white font-bold text-xl font-display">{initial}</span></div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{name}</p>
                  <p className="text-xs text-blue-500 font-medium mb-1">{role}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-slate-600 mt-6">Stockhold v2.0.0 · Made with ❤️ in India</p>
      </div>
    </div>
  );
}
