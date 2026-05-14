'use client';
import { useState, useRef } from 'react';
import { Product } from '@/types';
import { Upload, X, Scan } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BarcodeScanner } from '@/components/barcode/BarcodeScanner';

interface Props {
  initialData?: Partial<Product>;
  onSubmit:     (data: Partial<Product>, imageFile?: File) => void;
  loading?:     boolean;
  submitLabel?: string;
}

export function ProductForm({ initialData, onSubmit, loading, submitLabel = 'Save' }: Props) {
  const [name,     setName]     = useState(initialData?.name         || '');
  const [selling,  setSelling]  = useState(initialData?.sellingPrice?.toString() || '');
  const [cost,     setCost]     = useState(initialData?.costPrice?.toString()    || '');
  const [qty,      setQty]      = useState(initialData?.quantity?.toString()     || '');
  const [barcode,  setBarcode]  = useState(initialData?.barcode      || '');
  const [imgUrl,   setImgUrl]   = useState(initialData?.imageUrl     || '');
  const [imgFile,  setImgFile]  = useState<File | undefined>();
  const [showScan, setShowScan] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImgFile(f);
    setImgUrl(URL.createObjectURL(f));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, sellingPrice: parseFloat(selling), costPrice: parseFloat(cost), quantity: parseInt(qty, 10), barcode, imageUrl: imgUrl }, imgFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image upload */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">Product Image</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative w-full h-44 bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl flex items-center justify-center cursor-pointer hover:border-blue-300 transition-all overflow-hidden"
        >
          {imgUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgUrl} alt="preview" className="w-full h-full object-cover" />
              <button type="button" onClick={(e) => { e.stopPropagation(); setImgUrl(''); setImgFile(undefined); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center">
                <X size={13} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-slate-600">
              <Upload size={26} />
              <span className="text-sm font-medium">Tap to upload</span>
              <span className="text-xs">Auto compressed to WebP via Firebase Storage</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      <Input label="Product Name *" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Maggi Noodles" />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Selling Price *" prefix="₹" type="number" value={selling} onChange={(e) => setSelling(e.target.value)} required min="0" step="0.01" placeholder="0" />
        <Input label="Cost Price *"    prefix="₹" type="number" value={cost}    onChange={(e) => setCost(e.target.value)}    required min="0" step="0.01" placeholder="0" />
      </div>

      <Input label="Quantity *" type="number" value={qty} onChange={(e) => setQty(e.target.value)} required min="0" placeholder="0" />

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">Barcode</label>
        <div className="flex gap-2">
          <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Scan or type barcode" className="flex-1" />
          <Button type="button" variant="secondary" size="md" onClick={() => setShowScan(true)}>
            <Scan size={15} /> Scan
          </Button>
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full py-3">{submitLabel}</Button>

      {showScan && (
        <BarcodeScanner
          onScanned={(c) => { setBarcode(c); setShowScan(false); }}
          onClose={() => setShowScan(false)}
        />
      )}
    </form>
  );
}
