import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Download } from 'lucide-react';
import { type Photo } from '../lib/db';

interface LightboxProps {
  photo: Photo | null;
  onClose: () => void;
}

export default function Lightbox({ photo, onClose }: LightboxProps) {
  if (!photo) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
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
      alert('Sharing is not supported in this browser.');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = `${photo.title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-12 lg:p-24 bg-sophisticated-black/95 backdrop-blur-2xl"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-10 right-10 text-sophisticated-text/30 hover:text-gold transition-colors z-50"
        >
          <X size={40} strokeWidth={1} />
        </button>

        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full h-full flex flex-col md:flex-row bg-sophisticated-black border border-sophisticated-border/50 overflow-hidden cinematic-shadow"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-[3] bg-black/40 flex items-center justify-center overflow-hidden relative group">
            <img
              src={photo.dataUrl}
              alt={photo.title}
              className="max-w-full max-h-full object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sophisticated-black/40 to-transparent pointer-events-none"></div>
          </div>
          
          <div className="flex-1 p-12 lg:p-16 flex flex-col justify-center border-l border-sophisticated-border bg-sophisticated-gray/30">
            <div className="mb-12">
              <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold block mb-4">
                {photo.category}
              </span>
              <div className="w-8 h-[1px] bg-gold/40"></div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-serif text-sophisticated-text mb-8 leading-tight italic font-light tracking-tight">
              {photo.title}
            </h2>
            
            <div className="space-y-8">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.3em] text-sophisticated-text/30 mb-3 font-bold">Provenance</label>
                <p className="text-sophisticated-text/70 font-light leading-relaxed text-sm italic">
                  {photo.description}
                </p>
              </div>

              <div className="pt-12 mt-12 border-t border-sophisticated-border flex items-center justify-between">
                <div>
                  <label className="block text-[9px] uppercase tracking-[0.3em] text-sophisticated-text/30 mb-1 font-bold">Archived On</label>
                  <span className="text-[11px] text-sophisticated-text/50 font-medium tracking-wider">
                    {new Date(photo.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={handleShare}
                    className="p-3 border border-sophisticated-border text-sophisticated-text/40 hover:text-gold hover:border-gold/30 transition-all rounded-sm"
                    title="Share"
                  >
                    <Share2 size={16} />
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="p-3 bg-gold text-sophisticated-black hover:brightness-110 transition-all rounded-sm shadow-lg"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
