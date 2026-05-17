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

  // imageUrl is only used for preview — we never pass blob URLs to Firestore
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || '');
  const [imageFile,  setImageFile]  = useState<File | undefined>();
  const [showScan,   setShowScan]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    // Only use blob URL for local preview — never saved to Firestore
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      {
        name,
        sellingPrice: parseFloat(selling) || 0,
        costPrice:    parseFloat(cost)    || 0,
        quantity:     parseInt(qty, 10)   || 0,
        barcode,
        // Never include imageUrl here — the parent page manages upload and sets real URL
      },
      imageFile
    );
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(initialData?.imageUrl || ''); // revert to original if editing
    setImageFile(undefined);
    if (fileRef.current) fileRef.current.value = '';
  };

  const hasNewImage = !!imageFile;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image upload */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">
          Product Image
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative w-full aspect-square max-h-52 bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl flex items-center justify-center cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-all overflow-hidden"
        >
          {previewUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="preview"
                className="w-full h-full object-cover"
              />
              {/* Badge showing new image selected */}
              {hasNewImage && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  New image selected
                </div>
              )}
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all"
              >
                <X size={13} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-slate-600 p-6">
              <Upload size={26} />
              <span className="text-sm font-medium text-center">Tap to upload image</span>
              <span className="text-xs text-center text-gray-300 dark:text-slate-600">
                Uploaded securely to Cloudinary
              </span>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        {hasNewImage && (
          <p className="text-xs text-blue-500 mt-1.5 text-center">
            ✓ Image ready to upload
          </p>
        )}
      </div>

      <Input
        label="Product Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="e.g. Maggi Noodles"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Selling Price *"
          prefix="₹"
          type="number"
          value={selling}
          onChange={(e) => setSelling(e.target.value)}
          required
          min="0"
          step="0.01"
          placeholder="0"
        />
        <Input
          label="Cost Price *"
          prefix="₹"
          type="number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          required
          min="0"
          step="0.01"
          placeholder="0"
        />
      </div>

      <Input
        label="Quantity *"
        type="number"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        required
        min="0"
        placeholder="0"
      />

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">
          Barcode
        </label>
        <div className="flex gap-2">
          <Input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scan or type barcode"
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setShowScan(true)}
          >
            <Scan size={15} /> Scan
          </Button>
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full py-3">
        {loading ? 'Uploading & Saving…' : submitLabel}
      </Button>

      {showScan && (
        <BarcodeScanner
          onScanned={(c) => { setBarcode(c); setShowScan(false); }}
          onClose={() => setShowScan(false)}
        />
      )}
    </form>
  );
}
