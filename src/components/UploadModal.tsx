import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Camera } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/db';
import { useAuth } from '../lib/AuthContext';
import { compressImage } from '../lib/imageUtils';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Moments');
  const [preview, setPreview] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('File is too large. Max 4MB.');
        return;
      }

      setIsPreviewLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const compressed = await compressImage(base64);
          setPreview(compressed);
        } catch (err) {
          console.error('Compression failed:', err);
          setPreview(base64); // Fallback to original, might fail firestore limit
        }
        setIsPreviewLoading(false);
      };
      reader.onerror = (err) => {
        console.error('File reading error:', err);
        setIsPreviewLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const getOrCreateAlbum = async () => {
    if (!user) throw new Error('Auth required');
    
    const albumPath = 'albums';
    try {
      const q = query(
        collection(db, albumPath), 
        where('ownerId', '==', user.uid),
        where('title', '==', 'Default Album')
      );
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        return snap.docs[0].id;
      }

      const newAlbum = await addDoc(collection(db, albumPath), {
        title: 'Default Album',
        ownerId: user.uid,
        createdAt: Date.now()
      });
      return newAlbum.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, albumPath);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview || !title || isSaving || !user) return;

    setIsSaving(true);
    const photoPath = 'photos';
    try {
      const albumId = await getOrCreateAlbum();
      
      await addDoc(collection(db, photoPath), {
        title,
        description,
        category,
        url: preview,
        userId: user.uid,
        albumId: albumId,
        createdAt: serverTimestamp(),
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
      // handleFirestoreError is called inside getOrCreateAlbum or we can call it here if needed
      // but let's be safe
      if (err instanceof Error && !err.message.startsWith('{')) {
         handleFirestoreError(err, OperationType.CREATE, photoPath);
      }
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
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-sophisticated-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-sophisticated-black w-full max-w-xl rounded-sm border border-sophisticated-border cinematic-shadow relative overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent z-10"></div>
            
            <button
              onClick={onClose}
              className="absolute top-8 right-8 text-sophisticated-text/20 hover:text-gold transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="p-12 overflow-y-auto custom-scrollbar">
              <div className="mb-10 text-center">
                <h2 className="font-serif text-3xl italic mb-3 text-sophisticated-text leading-tight">Archive New Element</h2>
                <p className="text-sophisticated-text/30 text-[10px] uppercase tracking-[0.3em] font-bold">Add a fragment to the collective memory</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div 
                  onClick={() => {
                    if (!isPreviewLoading) fileInputRef.current?.click();
                  }}
                  className="group relative aspect-video bg-sophisticated-gray/50 border border-sophisticated-border rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-gold/30 hover:bg-gold/[0.03] transition-all overflow-hidden"
                >
                  {isPreviewLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full"
                      />
                      <span className="text-[8px] uppercase tracking-widest text-gold/60">Processing...</span>
                    </div>
                  ) : preview ? (
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
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="relative">
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
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gold/40">
                        <Upload size={12} className="rotate-180" />
                      </div>
                    </div>
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

                <div className="mt-4 flex flex-col gap-4">
                  {(!preview || !title) && (
                    <p className="text-[8px] uppercase tracking-[0.2em] text-red-400 font-bold text-center italic opacity-60">
                      {!preview ? "Select an image" : "Title required"} to unlock archives
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={!preview || !title || isSaving}
                    className="w-full py-5 text-[11px] uppercase tracking-[0.4em] font-black transition-all shadow-[0_10px_30px_-10px_rgba(197,160,89,0.3)] bg-gold text-sophisticated-black hover:brightness-110 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10">
                      {isSaving ? (
                        <span className="flex items-center gap-2">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-3 h-3 border-2 border-sophisticated-black border-t-transparent rounded-full"
                          />
                          Archiving...
                        </span>
                      ) : (
                        'Commit to Archives'
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
