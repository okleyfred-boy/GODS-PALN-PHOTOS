import { motion } from 'motion/react';

export default function AlbumHeader() {
  return (
    <div className="relative w-full">
      {/* Banner Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=2000" 
            alt="Cinematic Banner" 
            className="w-full h-full object-cover grayscale brightness-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sophisticated-black via-transparent to-sophisticated-black"></div>
        </motion.div>

        <div className="relative h-full max-w-7xl mx-auto flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h2 className="text-gold uppercase tracking-[0.8em] text-[10px] font-bold mb-8">
              Digital Artifacts
            </h2>
            <h1 className="text-7xl md:text-9xl font-serif text-sophisticated-text mb-8 italic font-extralight tracking-tighter">
              Aeterna
            </h1>
            <div className="flex items-center gap-6 justify-center">
              <div className="w-16 h-[1px] bg-gold/30"></div>
              <span className="text-sophisticated-text/30 text-[9px] uppercase tracking-[0.4em] font-medium">Vol. I — The Collection</span>
              <div className="w-16 h-[1px] bg-gold/30"></div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-gold/40 to-transparent"></div>
        </motion.div>
      </div>

      <header className="py-20 px-6 max-w-7xl mx-auto text-center border-b border-sophisticated-border/30">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
        >
          <p className="max-w-2xl mx-auto text-sophisticated-text/40 font-light leading-relaxed text-base tracking-wide italic font-serif">
            "We preserve not just the light, but the silence between the moments. A curated archive of fragmented time, captured in the pursuit of the ephemeral."
          </p>
        </motion.div>
      </header>
    </div>
  );
}
