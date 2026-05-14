'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Mail, Shield, ChevronRight, Crown, Store, Save, Camera, Trash2 } from 'lucide-react';
import { useAuthStore, useShopStore } from '@/lib/store';
import { useSubscription } from '@/hooks/useSubscription';
import { logOut } from '@/services/auth';
import { getProfile, saveProfile, uploadLogo, deleteLogo } from '@/services/profile';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { format } from 'date-fns';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const user      = useAuthStore((s) => s.user);
  const router    = useRouter();
  const { profile, setProfile } = useShopStore();
  const { subscription, isActive } = useSubscription();

  const [shopName,    setShopName]    = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone,   setShopPhone]   = useState('');
  const [shopLogo,    setShopLogo]    = useState('');
  const [saving,      setSaving]      = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then((p) => {
      if (!p) return;
      setShopName(p.shopName    || '');
      setShopAddress(p.shopAddress || '');
      setShopPhone(p.shopPhone  || '');
      setShopLogo(p.shopLogo    || '');
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveProfile(user.uid, { shopName: shopName.trim(), shopAddress: shopAddress.trim(), shopPhone: shopPhone.trim(), shopLogo });
      setProfile({ ...(profile as any), shopName: shopName.trim(), shopAddress: shopAddress.trim(), shopPhone: shopPhone.trim(), shopLogo });
      toast.success('Shop details saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadLogo(user.uid, file);
      setShopLogo(url);
      await saveProfile(user.uid, { shopLogo: url });
      toast.success('Logo uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleRemoveLogo = async () => {
    if (!user) return;
    try { await deleteLogo(user.uid); await saveProfile(user.uid, { shopLogo: '' }); setShopLogo(''); toast.success('Logo removed'); }
    catch { toast.error('Failed to remove logo'); }
  };

  const handleLogout = async () => {
    if (!confirm('Log out?')) return;
    setLoggingOut(true);
    try { await logOut(); router.replace('/auth/login'); }
    catch { toast.error('Failed to log out'); setLoggingOut(false); }
  };

  const expiryDate = subscription?.expiryDate?.toDate ? format(subscription.expiryDate.toDate(), 'dd MMM yyyy') : null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Manage your account & shop settings</p>
      </div>

      {/* User card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 flex items-center gap-4 mb-4">
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
          {user?.photoURL ? <Image src={user.photoURL} alt="avatar" fill className="object-cover" /> : <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">{user?.displayName?.[0]?.toUpperCase() || 'S'}</span>}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{user?.displayName || 'Shop Owner'}</p>
          <p className="text-gray-500 dark:text-slate-400 text-sm">{user?.email}</p>
        </div>
        <div className="ml-auto"><ThemeToggle /></div>
      </div>

      {/* Shop settings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Store size={15} className="text-blue-500" />
          <p className="font-semibold text-gray-900 dark:text-white">Shop Settings</p>
        </div>

        {/* Logo */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 dark:text-slate-400 block mb-2">Shop Logo</label>
          <div className="flex items-center gap-3">
            <div onClick={() => logoRef.current?.click()}
              className="relative w-20 h-20 rounded-2xl bg-gray-50 dark:bg-slate-700 border-2 border-dashed border-gray-200 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-blue-300 transition-all overflow-hidden"
            >
              {shopLogo
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={shopLogo} alt="logo" className="w-full h-full object-cover" />
                : uploading ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                : <Camera size={20} className="text-gray-300 dark:text-slate-600" />}
            </div>
            <div className="space-y-1.5">
              <button onClick={() => logoRef.current?.click()} className="text-xs font-medium text-blue-500 hover:text-blue-600 block">{shopLogo ? 'Change Logo' : 'Upload Logo'}</button>
              {shopLogo && <button onClick={handleRemoveLogo} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 size={10} /> Remove</button>}
              <p className="text-xs text-gray-400 dark:text-slate-500">Auto converted to WebP</p>
            </div>
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </div>

        <div className="space-y-3">
          <Input label="Shop Name *"     value={shopName}    onChange={(e) => setShopName(e.target.value)}    placeholder="Your shop name"     />
          <Input label="Shop Address"    value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} placeholder="123 Main St, City"  />
          <Input label="Contact Number"  value={shopPhone}   onChange={(e) => setShopPhone(e.target.value)}   placeholder="+91 98765 43210"    />
          <Button onClick={handleSave} loading={saving} disabled={!shopName.trim()} className="w-full">
            <Save size={14} /> Save Shop Details
          </Button>
          <p className="text-xs text-gray-400 dark:text-slate-500">Appears on all PDF invoices automatically</p>
        </div>
      </div>

      {/* Subscription */}
      <button onClick={() => router.push('/dashboard/subscription')}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl border mb-4 transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-blue-500' : 'bg-gray-200 dark:bg-slate-700'}`}>
          <Crown size={17} className={isActive ? 'text-white' : 'text-gray-400 dark:text-slate-500'} />
        </div>
        <div className="flex-1 text-left">
          <p className={`text-sm font-semibold ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
            {isActive ? 'Stockhold Pro – Active' : 'Free Plan'}
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            {isActive && expiryDate ? `Renews ${expiryDate}` : `Subscribe for ${formatINR(2000)}/month`}
          </p>
        </div>
        <ChevronRight size={15} className="text-gray-300 dark:text-slate-600" />
      </button>

      {/* Account info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden mb-4">
        {[
          { icon: User,   label: 'Display Name', value: user?.displayName || '—' },
          { icon: Mail,   label: 'Email',         value: user?.email        || '—' },
          { icon: Shield, label: 'Account Type',  value: user?.providerData?.[0]?.providerId === 'google.com' ? 'Google Account' : 'Email & Password' },
        ].map(({ icon: Icon, label, value }, idx, arr) => (
          <div key={label} className={`flex items-center gap-4 px-5 py-4 ${idx < arr.length - 1 ? 'border-b border-gray-50 dark:border-slate-700' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <Icon size={14} className="text-gray-500 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">{label}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info pages */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden mb-4">
        {[{ label: 'About Us', href: '/about' }, { label: 'Contact Us', href: '/contact' }, { label: 'Privacy Policy', href: '/privacy-policy' }].map(({ label, href }, idx, arr) => (
          <button key={href} onClick={() => router.push(href)}
            className={`w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all ${idx < arr.length - 1 ? 'border-b border-gray-50 dark:border-slate-700' : ''}`}>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
            <ChevronRight size={15} className="text-gray-300 dark:text-slate-600" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button onClick={handleLogout} disabled={loggingOut}
        className="w-full flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-red-900/50 px-5 py-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <LogOut size={14} className="text-red-500" />
          </div>
          <span className="font-medium text-sm text-red-600">{loggingOut ? 'Logging out...' : 'Log Out'}</span>
        </div>
        <ChevronRight size={15} className="text-red-300 dark:text-red-700" />
      </button>

      <p className="text-center text-xs text-gray-300 dark:text-slate-700 mt-8">Stockhold v2.0.0 · Made for Indian shop owners</p>
    </div>
  );
}
