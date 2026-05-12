import Dexie, { type Table } from 'dexie';

export interface Photo {
  id?: number;
  title: string;
  description: string;
  category: string;
  dataUrl: string; // Base64 of the image
  createdAt: number;
}

export class PhotoAlbumDB extends Dexie {
  photos!: Table<Photo>;

  constructor() {
    super('PhotoAlbumDB');
    this.version(1).stores({
      photos: '++id, category, createdAt'
    });
  }
}

export const db = new PhotoAlbumDB();

// Initial data seeder if empty
export const seedDatabase = async () => {
  const hasArchivedOnce = localStorage.getItem('archived_once');
  if (hasArchivedOnce) return;

  const count = await db.photos.count();
  if (count === 0) {
    const initialPhotos: Photo[] = [
      {
        title: "Portrait of Stillness",
        description: "A moment of reflection captured in soft golden light.",
        category: "Portraits",
        dataUrl: "https://picsum.photos/seed/portrait1/1200/1600",
        createdAt: Date.now() - 100000
      },
      {
        title: "Morning Ritual",
        description: "The quiet beauty of a new day and a fresh brew.",
        category: "Lifestyle",
        dataUrl: "https://picsum.photos/seed/coffee/1600/1200",
        createdAt: Date.now() - 200000
      },
      {
        title: "Ethereal Coast",
        description: "Where the mist meets the rugged edges of the world.",
        category: "Scenic",
        dataUrl: "https://picsum.photos/seed/coast/1600/900",
        createdAt: Date.now() - 300000
      }
    ];
    await db.photos.bulkAdd(initialPhotos);
    localStorage.setItem('archived_once', 'true');
  }
};
