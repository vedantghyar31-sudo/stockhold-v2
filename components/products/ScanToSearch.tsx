'use client';
import { useState, useRef } from 'react';
import { X, ScanLine, Upload, Search, Package, Camera } from 'lucide-react';
import { Product } from '@/types';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface Props {
  products: Product[];
  onClose:  () => void;
  onFound:  (id: string) => void;
}

export function ScanToSearch({ products, onClose, onFound }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview,  setPreview]  = useState<string | null>(null);
  const [text,     setText]     = useState('');
  const [results,  setResults]  = useState<Product[]>([]);
  const [scanning, setScanning] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = (raw: string) => {
    const words   = raw.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    if (words.length === 0) { setScanning(false); return; }
    const matched = products.filter((p) =>
      words.some(
        (w) =>
          p.name.toLowerCase().includes(w) ||
          (p.barcode || '').toLowerCase().includes(w)
      )
    );
    setResults(matched);
    setSearched(true);
    setScanning(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting same file
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setScanning(true);
    setSearched(false);
    setResults([]);
    setText('');

    const key = process.env.NEXT_PUBLIC_OCR_SPACE_API_KEY;

    if (key) {
      try {
        const form = new FormData();
        form.append('file',     file);
        form.append('apikey',   key);
        form.append('language', 'eng');
        form.append('isOverlayRequired', 'false');

        const res  = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          body:   form,
        });
        const data = await res.json();
        const raw  = data?.ParsedResults?.[0]?.ParsedText || '';

        if (!raw.trim()) {
          toast('No text found in image. Try a clearer photo.', { icon: 'ℹ️' });
          setScanning(false);
          return;
        }
        setText(raw);
        search(raw);
      } catch (err) {
        console.error('OCR error:', err);
        toast.error('OCR extraction failed. Try manually entering text.');
        setScanning(false);
      }
    } else {
      // Fallback: use filename as search term
      const fallback = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ');
      setText(fallback);
      toast('OCR key not set — searching by filename', { icon: 'ℹ️' });
      search(fallback);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ScanLine size={17} className="text-blue-500" />
            <span className="font-semibold text-gray-900 dark:text-white">
              Scan to Search
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="relative border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-all"
            style={{ minHeight: 160 }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="scan preview"
                className="w-full h-40 object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400 dark:text-slate-600">
                <div className="flex gap-3">
                  <Upload size={22} />
                  <Camera size={22} />
                </div>
                <p className="text-sm font-medium">
                  Upload or capture a product image
                </p>
                <p className="text-xs text-center px-4">
                  OCR will extract text and match your inventory
                </p>
              </div>
            )}

            {/* Scanning overlay */}
            {scanning && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <p className="text-white text-sm font-medium">Extracting text…</p>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />

          {/* Manual text edit + re-search */}
          {text && (
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-slate-400 block mb-1.5">
                Extracted text (edit if needed)
              </label>
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Edit extracted text…"
                />
                <Button size="sm" onClick={() => search(text)} className="px-3">
                  <Search size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* Results */}
          {searched && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                {results.length > 0
                  ? `${results.length} match${results.length > 1 ? 'es' : ''} found`
                  : 'No matching products found'}
              </p>

              {results.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <Package size={28} className="text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-slate-600">
                    No products matched the scanned image
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">
                    Try editing the text above and searching again
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {results.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onFound(p.id)}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all text-left"
                    >
                      {/* Squircle thumbnail */}
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700 shrink-0 flex items-center justify-center">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package size={14} className="text-gray-400 dark:text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">
                          {formatINR(p.sellingPrice)} · {p.quantity} in stock
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* OCR hint */}
          {!process.env.NEXT_PUBLIC_OCR_SPACE_API_KEY && (
            <p className="text-xs text-gray-400 dark:text-slate-600 text-center">
              Add{' '}
              <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded text-xs">
                NEXT_PUBLIC_OCR_SPACE_API_KEY
              </code>{' '}
              for full OCR support
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
