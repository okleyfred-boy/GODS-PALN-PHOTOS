import React from 'react';
import { motion } from 'motion/react';
import { Trash2, Maximize2, Share2 } from 'lucide-react';
import { type Photo } from '../lib/db';

interface PhotoCardProps {
  photo: Photo;
  onDelete: (id: number) => void;
  onView: (photo: Photo) => void;
}

export default function PhotoCard({ photo, onDelete, onView }: PhotoCardProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        // Convert data URL to blob
        const res = await fetch(photo.dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `${photo.title.replace(/\s+/g, '_')}.jpg`, { type: 'image/jpeg' });

        await navigator.share({
          title: photo.title,
          text: photo.description,
          files: [file],
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to sharing just text if file sharing fails
        try {
          await navigator.share({
            title: photo.title,
            text: photo.description,
            url: window.location.href,
          });
        } catch (err) {
          console.error('Final share fallback failed:', err);
        }
      }
    } else {
      alert('Sharing is not supported in this browser environment.');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8 }}
      className="group relative bg-sophisticated-gray border border-sophisticated-border cinematic-shadow rounded-sm overflow-hidden aspect-[3/4]"
    >
      <img
        src={photo.dataUrl}
        alt={photo.title}
        className="w-full h-full object-cover sepia-hover cursor-pointer"
        referrerPolicy="no-referrer"
        onClick={() => onView(photo)}
      />
      
      <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-sophisticated-black via-sophisticated-black/60 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
        <h3 className="text-sophisticated-text font-serif text-2xl mb-1 italic">{photo.title}</h3>
        <p className="text-sophisticated-text/50 text-[10px] font-light mb-6 uppercase tracking-widest">{photo.category}</p>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onView(photo)}
            className="flex items-center gap-2 text-gold text-[10px] uppercase tracking-[0.25em] font-bold hover:brightness-125 transition-all"
          >
            Details
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-sophisticated-text/60 text-[10px] uppercase tracking-[0.25em] font-bold hover:text-gold transition-all"
          >
            <Share2 size={12} />
            Share
          </button>
          <button 
            onClick={() => photo.id && onDelete(photo.id)}
            className="flex items-center gap-2 text-red-500/60 text-[10px] uppercase tracking-[0.25em] font-bold hover:text-red-500 transition-all ml-auto"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="absolute top-6 left-6">
        <div className="w-1.5 h-1.5 bg-gold rounded-full opacity-60 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(197,160,89,0.5)]"></div>
      </div>
    </motion.div>
  );
}
