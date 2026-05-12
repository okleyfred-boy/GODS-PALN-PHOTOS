import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Camera } from 'lucide-react';
import { db } from '../lib/db';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Moments');
  const [preview, setPreview] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setIsConfirming(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview || !title) return;

    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    await db.photos.add({
      title,
      description,
      category,
      dataUrl: preview,
      createdAt: Date.now(),
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setCategory('Moments');
    setPreview(null);
    setIsConfirming(false);
    onSuccess();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sophisticated-black/80 backdrop-blur-md"
          onClick={() => {
            setIsConfirming(false);
            onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-sophisticated-black w-full max-w-xl rounded-sm p-12 border border-sophisticated-border cinematic-shadow relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
            
            <button
              onClick={() => {
                setIsConfirming(false);
                onClose();
              }}
              className="absolute top-8 right-8 text-sophisticated-text/20 hover:text-gold transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-10 text-center">
              <h2 className="font-serif text-3xl italic mb-3 text-sophisticated-text leading-tight">Archive New Element</h2>
              <p className="text-sophisticated-text/30 text-[10px] uppercase tracking-[0.3em] font-bold">Add a fragment to the collective memory</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative aspect-video bg-sophisticated-gray/50 border border-sophisticated-border rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-gold/30 hover:bg-gold/[0.03] transition-all overflow-hidden"
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-sophisticated-black border border-sophisticated-border flex items-center justify-center mb-4 group-hover:border-gold group-hover:scale-105 transition-all shadow-xl">
                      <Camera size={20} className="text-gold/60 group-hover:text-gold transition-colors" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-sophisticated-text/20 font-bold italic">Select Negative</span>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-sophisticated-text/30 font-bold block ml-1">Label</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setIsConfirming(false);
                    }}
                    className="w-full bg-sophisticated-gray/30 border border-sophisticated-border p-4 text-xs tracking-wider text-sophisticated-text focus:outline-none focus:border-gold/50 transition-colors placeholder:opacity-10"
                    placeholder="Reference..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-sophisticated-text/30 font-bold block ml-1">Section</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setIsConfirming(false);
                    }}
                    className="w-full bg-sophisticated-gray/30 border border-sophisticated-border p-4 text-xs tracking-wider text-sophisticated-text focus:outline-none focus:border-gold/50 transition-colors appearance-none cursor-pointer"
                  >
                    <option>Moments</option>
                    <option>Portraits</option>
                    <option>Lifestyle</option>
                    <option>Travel</option>
                    <option>Scenic</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.3em] text-sophisticated-text/30 font-bold block ml-1">Narration</label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsConfirming(false);
                  }}
                  className="w-full bg-sophisticated-gray/30 border border-sophisticated-border p-4 text-xs tracking-wider text-sophisticated-text focus:outline-none focus:border-gold/50 transition-colors resize-none h-28 placeholder:opacity-10"
                  placeholder="The story behind the lens..."
                />
              </div>

              <button
                type="submit"
                disabled={!preview || !title}
                className={`w-full py-5 text-[11px] uppercase tracking-[0.4em] font-black transition-all shadow-[0_10px_30px_-10px_rgba(197,160,89,0.3)] mt-4 ${
                  isConfirming 
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                    : 'bg-gold text-sophisticated-black hover:brightness-110'
                } disabled:opacity-20 disabled:cursor-not-allowed`}
              >
                {isConfirming ? 'Confirm Archive?' : 'Commit to Archives'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
