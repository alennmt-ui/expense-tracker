import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Store, Calendar, CreditCard, LayoutGrid, X, Plus, Sparkles, Trash2 } from 'lucide-react';
import Modal from '../Modal';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import * as api from '@/src/api';

interface ScanReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: { merchant: string; amount: number; date: string }) => void;
}

export default function ScanReceiptModal({ isOpen, onClose, onComplete }: ScanReceiptModalProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{ merchant: string; amount: number; date: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('uploading');
    setError(null);

    try {
      setStatus('processing');
      const response = await api.uploadReceipt(file);
      
      const adapted = api.adaptOCRData(response.data);
      setExtractedData(adapted);
      setStatus('success');
    } catch (err) {
      console.error('OCR Error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleConfirm = () => {
    if (extractedData) {
      onComplete(extractedData);
      onClose();
      // Reset state for next time
      setTimeout(() => {
        setStatus('idle');
        setExtractedData(null);
      }, 300);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Receipt">
      <div className="px-6 pb-8 space-y-6">
        {status === 'idle' && (
          <div className="relative aspect-[3/4] bg-surface-container-low rounded-3xl overflow-hidden border-2 border-dashed border-outline-variant flex flex-col items-center justify-center group">
            <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-6 group-hover:scale-110 transition-transform duration-300">
              <Camera className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-on-surface font-headline mb-2">Capture Receipt</h3>
            <p className="text-sm text-on-surface-variant text-center px-12 mb-8">
              Position the receipt within the frame for automatic data extraction
            </p>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col gap-3 w-full px-8">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-on-primary-container text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-surface-tint/20"
              >
                <Upload className="w-5 h-5" />
                Upload from Gallery
              </button>
              <button className="w-full py-4 bg-surface-container-highest text-on-surface rounded-xl font-bold">
                Open Camera
              </button>
            </div>
          </div>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <div className="relative aspect-[3/4] bg-surface-container-low rounded-3xl overflow-hidden flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-6">
              <Loader2 className="w-24 h-24 text-surface-tint animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-8 h-8 text-surface-tint" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-on-surface font-headline mb-2">
              {status === 'uploading' ? 'Uploading...' : 'Analyzing Receipt...'}
            </h3>
            <p className="text-sm text-on-surface-variant animate-pulse">
              Gemini AI is extracting transaction details
            </p>
            
            <motion.div
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[2px] bg-on-primary-container shadow-[0_0_15px_#497cff]"
            />
          </div>
        )}

        {status === 'success' && extractedData && (
          <div className="space-y-6">
             {/* Preview Section */}
            <section className="relative aspect-[3/2] w-full bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
              <div className="absolute inset-0 flex items-center justify-center bg-secondary-container/10">
                <CheckCircle2 className="w-16 h-16 text-secondary" />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-surface-container-lowest/85 backdrop-blur-xl px-4 py-3 rounded-xl flex items-center justify-between border border-white/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    <span className="text-sm font-bold text-on-surface">Analysis Complete</span>
                  </div>
                  <span className="text-xs font-bold text-secondary">100% Verified</span>
                </div>
              </div>
            </section>

            {/* Extracted Data Fields */}
            <section className="bg-surface-container-low rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-headline font-extrabold text-[10px] text-on-surface-variant uppercase tracking-widest">Extracted Details</h2>
                <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Confidence High</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1 tracking-wider">Merchant</label>
                  <div className="bg-surface-container-lowest p-3 rounded-lg border border-transparent flex items-center gap-3">
                    <Store className="w-4 h-4 text-on-surface-variant" />
                    <input 
                      className="bg-transparent border-none p-0 text-sm font-bold w-full focus:ring-0 text-on-surface" 
                      type="text" 
                      value={extractedData.merchant} 
                      onChange={(e) => setExtractedData({...extractedData, merchant: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1 tracking-wider">Date</label>
                    <div className="bg-surface-container-lowest p-3 rounded-lg border border-transparent flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-on-surface-variant" />
                      <input 
                        className="bg-transparent border-none p-0 text-sm font-bold w-full focus:ring-0 text-on-surface" 
                        type="text" 
                        value={extractedData.date} 
                        onChange={(e) => setExtractedData({...extractedData, date: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1 tracking-wider">Total Amount</label>
                    <div className="bg-surface-container-lowest p-3 rounded-lg border border-transparent flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-on-surface-variant" />
                      <div className="flex items-center w-full">
                        <span className="text-sm font-bold text-on-surface-variant mr-1">$</span>
                        <input 
                          className="bg-transparent border-none p-0 text-sm font-bold w-full focus:ring-0 text-on-surface" 
                          type="text" 
                          value={extractedData.amount} 
                          onChange={(e) => setExtractedData({...extractedData, amount: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom Action Area */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setStatus('idle')}
                className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center active:scale-95 transition-transform text-on-surface"
              >
                <Trash2 className="w-6 h-6" />
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 h-14 bg-gradient-to-r from-on-primary-container to-surface-tint text-white rounded-xl font-headline font-bold flex items-center justify-center gap-2 shadow-lg shadow-surface-tint/20 active:scale-[0.98] transition-transform"
              >
                <CheckCircle2 className="w-5 h-5 fill-current" />
                Confirm & Add Expense
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="relative aspect-[3/4] bg-surface-container-low rounded-3xl overflow-hidden flex flex-col items-center justify-center px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-error-container flex items-center justify-center text-on-error-container mb-6">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-on-surface font-headline mb-2">Processing Failed</h3>
            <p className="text-sm text-error mb-8">{error}</p>
            <button 
              onClick={() => setStatus('idle')}
              className="px-8 py-3 bg-on-primary-container text-white rounded-xl font-bold"
            >
              Try Again
            </button>
          </div>
        )}

        {status === 'idle' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-container-low p-3 rounded-2xl flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-2">
                <span className="text-xs font-bold">1</span>
              </div>
              <p className="text-[10px] font-bold text-on-surface uppercase tracking-tighter">Capture</p>
            </div>
            <div className="bg-surface-container-low p-3 rounded-2xl flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-2">
                <span className="text-xs font-bold">2</span>
              </div>
              <p className="text-[10px] font-bold text-on-surface uppercase tracking-tighter">Analyze</p>
            </div>
            <div className="bg-surface-container-low p-3 rounded-2xl flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-2">
                <span className="text-xs font-bold">3</span>
              </div>
              <p className="text-[10px] font-bold text-on-surface uppercase tracking-tighter">Confirm</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
