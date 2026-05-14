'use client';
import { useEffect, useRef, useState } from 'react';
import { X, Camera } from 'lucide-react';

interface Props {
  onScanned: (code: string) => void;
  onClose:   () => void;
}

export function BarcodeScanner({ onScanned, onClose }: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const frameRef    = useRef<number>(0);
  const [error,     setError]   = useState<string | null>(null);
  const [scanning,  setScanning] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stop();
  }, []);

  const stop = () => {
    cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        detect();
        setScanning(true);
      }
    } catch {
      setError('Camera access denied. Please allow camera or enter barcode manually.');
    }
  };

  const detect = async () => {
    if (!('BarcodeDetector' in window)) {
      setError('BarcodeDetector not supported in this browser. Enter barcode manually below.');
      return;
    }
    // @ts-ignore
    const detector = new BarcodeDetector({ formats: ['ean_13','ean_8','code_128','code_39','qr_code','upc_a','upc_e'] });
    const scan = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        frameRef.current = requestAnimationFrame(scan);
        return;
      }
      try {
        const results = await detector.detect(videoRef.current);
        if (results.length > 0) {
          stop();
          onScanned(results[0].rawValue);
          return;
        }
      } catch { /* keep scanning */ }
      frameRef.current = requestAnimationFrame(scan);
    };
    frameRef.current = requestAnimationFrame(scan);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Camera size={17} className="text-blue-500" />
            <span className="font-semibold text-gray-900 dark:text-white">Scan Barcode</span>
          </div>
          <button onClick={() => { stop(); onClose(); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
        </div>

        <div className="relative bg-black" style={{ height: 240 }}>
          {error
            ? <div className="flex items-center justify-center h-full p-5"><p className="text-white text-sm text-center opacity-80">{error}</p></div>
            : (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                {/* Viewfinder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-28 relative">
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-blue-400 rounded-tl" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-blue-400 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-blue-400 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-blue-400 rounded-br" />
                    {scanning && <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-400 animate-bounce" />}
                  </div>
                </div>
              </>
            )}
        </div>

        <div className="p-4">
          <p className="text-xs text-gray-400 text-center mb-3">Point camera at barcode · or type manually</p>
          <input
            type="text"
            placeholder="Type barcode and press Enter..."
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const v = (e.target as HTMLInputElement).value.trim();
                if (v) { stop(); onScanned(v); }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
