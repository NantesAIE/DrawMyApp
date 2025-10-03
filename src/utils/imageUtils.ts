export interface ImageUploadResult {
  imageData: string;
  width: number;
  height: number;
}

export const uploadImageFile = (): Promise<ImageUploadResult> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('Aucun fichier sélectionné'));
        return;
      }

      if (!file.type.startsWith('image/')) {
        reject(new Error('Le fichier doit être une image'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        
        // Create an image element to get dimensions
        const img = new Image();
        img.onload = () => {
          resolve({
            imageData,
            width: img.width,
            height: img.height,
          });
        };
        img.onerror = () => {
          reject(new Error('Erreur lors du chargement de l\'image'));
        };
        img.src = imageData;
      };
      
      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };
      
      reader.readAsDataURL(file);
    };

    input.click();
  });
};

export const resizeImage = (
  imageData: string,
  maxWidth: number,
  maxHeight: number
): Promise<{ imageData: string; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Impossible de créer le contexte canvas'));
        return;
      }

      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert back to base64
      const resizedImageData = canvas.toDataURL('image/png');
      
      resolve({
        imageData: resizedImageData,
        width,
        height,
      });
    };

    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'));
    };

    img.src = imageData;
  });
};