/**
 * Utility to compress and resize images to fit within Firestore's 1MB document limit.
 */

const MAX_DIMENSION = 1600;
const MAX_BYTES = 1048487; // Just under 1MB

export async function compressImage(dataUrl: string): Promise<string> {
  // If already under limit, return as is (unlikely for 4MB raw)
  if (dataUrl.length <= MAX_BYTES) return dataUrl;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Iterative compression
      let quality = 0.9;
      let compressed = canvas.toDataURL('image/jpeg', quality);

      while (compressed.length > MAX_BYTES && quality > 0.1) {
        quality -= 0.1;
        compressed = canvas.toDataURL('image/jpeg', quality);
      }

      if (compressed.length > MAX_BYTES) {
        // If still too big, force even lower quality or smaller dimensions
        // For this requirement, we'll try one last aggressive pass
        quality = 0.05;
        compressed = canvas.toDataURL('image/jpeg', quality);
      }

      console.log(`Original: ${Math.round(dataUrl.length / 1024)}KB, Compressed: ${Math.round(compressed.length / 1024)}KB, Quality: ${quality}`);
      resolve(compressed);
    };
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
}
