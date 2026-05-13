import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  getDocs,
  writeBatch,
  addDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/db';
import AlbumHeader from './components/AlbumHeader';
import PhotoGrid from './components/PhotoGrid';
import Lightbox from './components/Lightbox';
import UploadModal from './components/UploadModal';
import Navigation from './components/Navigation';
import { useAuth } from './lib/AuthContext';

export interface Photo {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  createdAt: any;
  userId: string;
  albumId: string;
}

const CATEGORIES = ['All', 'Moments', 'Portraits', 'Lifestyle', 'Travel', 'Scenic'];

export default function App() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [albumId, setAlbumId] = useState<string | null>(null);

  // Fetch or find default album
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setPhotos([]);
      setAlbumId(null);
      return;
    }

    let isMounted = true;
    const findAlbum = async () => {
      const albumPath = 'albums';
      try {
        const q = query(
          collection(db, albumPath), 
          where('ownerId', '==', user.uid),
          where('title', '==', 'Default Album')
        );
        const snap = await getDocs(q);
        if (!isMounted) return;

        if (!snap.empty) {
          setAlbumId(snap.docs[0].id);
        } else {
          // Create default album immediately
          const newAlbum = await addDoc(collection(db, albumPath), {
            title: 'Default Album',
            ownerId: user.uid,
            createdAt: Date.now()
          });
          if (isMounted) setAlbumId(newAlbum.id);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, albumPath);
      }
    };

    findAlbum();
    return () => { isMounted = false; };
  }, [user, isAuthenticated]);

  // Subscribe to photos
  useEffect(() => {
    if (!albumId || !user) return;

    const photoPath = 'photos';
    const q = query(
      collection(db, photoPath),
      where('userId', '==', user.uid),
      where('albumId', '==', albumId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];
      
      // Sort in-memory as requested to avoid manual indexes requirement
      const sorted = photoData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || a.createdAt || 0;
        const timeB = b.createdAt?.toMillis?.() || b.createdAt || 0;
        return timeB - timeA;
      });
      
      setPhotos(sorted);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, photoPath);
    });

    return () => unsubscribe();
  }, [albumId, user]);

  const handleDelete = async (id: string) => {
    if (!isAuthenticated) return;
    const photoPath = `photos/${id}`;
    try {
      await deleteDoc(doc(db, 'photos', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, photoPath);
    }
  };

  const handleClearAll = async () => {
    if (!isAuthenticated || !user || !albumId) return;
    const photoPath = 'photos';
    try {
      const q = query(
        collection(db, photoPath),
        where('userId', '==', user.uid),
        where('albumId', '==', albumId)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      setIsClearing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, photoPath);
    }
  };

  const handleToggleUpload = () => {
    if (isAuthenticated) {
      setIsUploadOpen(true);
    } else {
      alert('Authentication required to capture new moments.');
    }
  };

  const filteredPhotos = photos.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-sophisticated-black flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-gold/10 border-t-gold rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40 pt-20">
      <Navigation />
      <AlbumHeader />

      <main className="max-w-7xl mx-auto px-6">
        {/* Gallery Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-8 border-y border-sophisticated-border/40 py-10">
          <div className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-8 py-2 text-[10px] uppercase tracking-[0.3em] font-bold transition-all ${
                  activeCategory === cat 
                    ? 'text-gold border-b-2 border-gold pb-1.5' 
                    : 'text-sophisticated-text/30 hover:text-sophisticated-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {isAuthenticated && photos.length > 0 && (
              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {isCleaning && (
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={async () => {
                        const seen = new Set();
                        const duplicates: string[] = [];
                        photos.forEach(p => {
                          if (seen.has(p.url)) {
                            duplicates.push(p.id);
                          } else {
                            seen.add(p.url);
                          }
                        });

                        if (duplicates.length > 0) {
                          const batch = writeBatch(db);
                          duplicates.forEach(id => batch.delete(doc(db, 'photos', id)));
                          await batch.commit();
                        }
                        setIsCleaning(false);
                      }}
                      className="px-4 py-2 bg-gold text-sophisticated-black text-[9px] uppercase tracking-widest font-bold rounded-full"
                    >
                      Confirm Clean
                    </motion.button>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setIsCleaning(!isCleaning)}
                  className={`group flex items-center gap-3 px-5 py-3 border rounded-full transition-all ${
                    isCleaning ? 'bg-gold/10 border-gold' : 'bg-sophisticated-gray/50 border-sophisticated-border hover:border-gold/30 hover:bg-gold/[0.05]'
                  }`}
                  title="Clean Duplicates"
                >
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isCleaning ? 'bg-gold' : 'bg-gold/40 group-hover:bg-gold'}`}></div>
                  <span className={`text-[10px] uppercase tracking-[0.3em] font-bold ${isCleaning ? 'text-gold' : 'text-sophisticated-text/40 group-hover:text-sophisticated-text/80'}`}>
                    {isCleaning ? 'Cancel' : 'Clean'}
                  </span>
                </button>
              </div>
            )}

            {isAuthenticated && photos.length > 0 && (
              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {isClearing && (
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={handleClearAll}
                      className="px-4 py-2 bg-red-500 text-white text-[9px] uppercase tracking-widest font-bold rounded-full animate-pulse"
                    >
                      Confirm Purge
                    </motion.button>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setIsClearing(!isClearing)}
                  className={`group flex items-center gap-3 px-5 py-3 border rounded-full transition-all ${
                    isClearing ? 'bg-red-500/10 border-red-500' : 'bg-sophisticated-gray/50 border-sophisticated-border hover:border-red-500/30 hover:bg-red-500/[0.05]'
                  }`}
                  title="Clear All"
                >
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isClearing ? 'bg-red-500' : 'bg-red-500/40 group-hover:bg-red-500'}`}></div>
                  <span className={`text-[10px] uppercase tracking-[0.3em] font-bold ${isClearing ? 'text-red-500' : 'text-sophisticated-text/40 group-hover:text-red-500'}`}>
                    {isClearing ? 'Cancel' : 'Clear All'}
                  </span>
                </button>
              </div>
            )}

            <div className="relative group">
              <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-sophisticated-text/20 group-focus-within:text-gold transition-colors" />
              <input
                type="text"
                placeholder="Search archives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-b border-sophisticated-border/40 py-2 pl-6 text-xs tracking-widest focus:outline-none focus:border-gold transition-all w-48 md:w-64 placeholder:opacity-30"
              />
            </div>
            
            <button
              onClick={handleToggleUpload}
              className={`group flex items-center justify-center w-12 h-12 rounded-full transition-all transform hover:rotate-90 shadow-2xl relative ${
                isAuthenticated 
                  ? 'bg-gold border border-gold text-sophisticated-black hover:brightness-110' 
                  : 'bg-sophisticated-gray border border-sophisticated-border text-sophisticated-text/20 hover:border-gold/30'
              }`}
              title={isAuthenticated ? 'Capture Moment' : 'Sign in to Archive'}
            >
              {isAuthenticated ? <Plus size={18} /> : <Lock size={16} />}
              {!isAuthenticated && (
                <div className="absolute -top-12 right-0 bg-sophisticated-black border border-gold/30 px-3 py-1.5 rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <p className="text-[8px] uppercase tracking-widest text-gold font-bold">Sign in required</p>
                </div>
              )}
            </button>

          </div>
        </div>

        {/* Gallery Content */}
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <div className="py-40 text-center">
               <span className="inline-block p-8 mb-6 border border-gold/20 rounded-full">
                <Lock size={32} className="text-gold/40" />
              </span>
              <p className="text-sophisticated-text/20 italic font-serif text-xl tracking-tight mb-4">The archives are locked to non-curators.</p>
              <button 
                onClick={() => { /* Handled in Navigation but we can repeat logic or use a ref */ }}
                className="text-[10px] uppercase tracking-widest text-gold border-b border-gold/40 pb-1"
              >
                Identification Required
              </button>
            </div>
          ) : filteredPhotos.length > 0 ? (
            <motion.div
              key={activeCategory + searchQuery}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <PhotoGrid 
                photos={filteredPhotos} 
                activeCategory={activeCategory} 
                onDelete={handleDelete} 
                onView={setSelectedPhoto} 
              />
            </motion.div>
          ) : (
            <div className="py-40 text-center">
              <span className="inline-block p-8 mb-6 border border-sophisticated-border rounded-full">
                <Filter size={32} className="text-sophisticated-text/10" />
              </span>
              <p className="text-sophisticated-text/20 italic font-serif text-xl tracking-tight">The archives are silent for this selection.</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Hint */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-12 left-12 pointer-events-none hidden lg:block"
      >
        <div className="flex items-center gap-6 text-[9px] uppercase tracking-[0.4em] text-sophisticated-text/20 font-bold">
          <div className="w-16 h-[1px] bg-sophisticated-border"></div>
          Aeterna Digital Archives
        </div>
      </motion.div>

      {/* Overlays */}
      <Lightbox 
        photo={selectedPhoto} 
        onClose={() => setSelectedPhoto(null)} 
      />
      
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={() => {}} // Snapshot handles updates
      />
    </div>
  );
}
