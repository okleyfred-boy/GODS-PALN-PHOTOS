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
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File input change detected', file ? `File: ${file.name}` : 'No file selected');
    if (file) {
      setIsPreviewLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('File read as DataURL completed');
        setPreview(reader.result as string);
        setIsPreviewLoading(false);
      };
      reader.onerror = (err) => {
        console.error('File reading error:', err);
        setIsPreviewLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview || !title || isSaving) return;

    setIsSaving(true);
    try {
      await db.photos.add({
        title,
        description,
        category,
        dataUrl: preview,
        createdAt: Date.now(),
      });
      console.log('Successfully archived new element');
      
      // Reset and close
      setTitle('');
      setDescription('');
      setCategory('Moments');
      setPreview(null);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to add to database:', err);
      alert('Failed to archive. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sophisticated-black/80 backdrop-blur-md"
          onClick={onClose}
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
              onClick={onClose}
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
                onClick={() => {
                  console.log('File selection triggered');
                  fileInputRef.current?.click();
                }}
                className="group relative aspect-video bg-sophisticated-gray/50 border border-sophisticated-border rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-gold/30 hover:bg-gold/[0.03] transition-all overflow-hidden"
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-sophisticated-black border border-sophisticated-border flex items-center justify-center mb-4 group-hover:border-gold group-hover:scale-105 transition-all shadow-xl">
                      <Camera size={20} className="text-gold/60 group-hover:text-gold transition-colors" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-sophisticated-text/20 font-bold italic">Select Image</span>
                  </>
                )}
                <input
                  type="file"
                  id="image-upload-input"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-sophisticated-text/30 font-bold block ml-1">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-sophisticated-gray/30 border border-sophisticated-border p-4 text-xs tracking-wider text-sophisticated-text focus:outline-none focus:border-gold/50 transition-colors placeholder:opacity-10"
                    placeholder="Capture title..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-sophisticated-text/30 font-bold block ml-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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
                <label className="text-[9px] uppercase tracking-[0.3em] text-sophisticated-text/30 font-bold block ml-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-sophisticated-gray/30 border border-sophisticated-border p-4 text-xs tracking-wider text-sophisticated-text focus:outline-none focus:border-gold/50 transition-colors resize-none h-28 placeholder:opacity-10"
                  placeholder="Tell the story..."
                />
              </div>


              <button
                type="submit"
                disabled={!preview || !title || isSaving}
                className="w-full py-5 text-[11px] uppercase tracking-[0.4em] font-black transition-all shadow-[0_10px_30px_-10px_rgba(197,160,89,0.3)] mt-4 bg-gold text-sophisticated-black hover:brightness-110 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSaving ? (
                  <>
                    <div className="w-1.5 h-1.5 bg-sophisticated-black rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-sophisticated-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-sophisticated-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <span className="ml-2">Archiving...</span>
                  </>
                ) : (
                  'Commit to Archives'
                )}
              </button>

            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

  );
}
