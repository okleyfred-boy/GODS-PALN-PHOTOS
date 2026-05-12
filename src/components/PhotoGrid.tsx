import { motion, AnimatePresence } from 'motion/react';
import { type Photo } from '../lib/db';
import PhotoCard from './PhotoCard';

interface PhotoGridProps {
  photos: Photo[];
  activeCategory: string;
  onDelete: (id: number) => void;
  onView: (photo: Photo) => void;
}

export default function PhotoGrid({ photos, activeCategory, onDelete, onView }: PhotoGridProps) {
  const filteredPhotos = activeCategory === 'All' 
    ? photos 
    : photos.filter(p => p.category === activeCategory);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      <AnimatePresence mode="popLayout">
        {filteredPhotos.map((photo) => (
          <div key={photo.id}>
            <PhotoCard 
              photo={photo} 
              onDelete={onDelete} 
              onView={onView} 
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
