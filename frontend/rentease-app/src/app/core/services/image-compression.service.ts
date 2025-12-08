import { Injectable } from '@angular/core';
import imageCompression, { Options } from 'browser-image-compression';

// Image compression service - compresses images before upload
@Injectable({
  providedIn: 'root'
})
export class ImageCompressionService {
  // default options
  private readonly defaultOptions: Options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg'
  };

  // compress single image
  async compressImage(file: File, options?: Partial<Options>): Promise<File> {
    try {
      const compressionOptions = { ...this.defaultOptions, ...options };
      const compressedFile = await imageCompression(file, compressionOptions);
      
      console.log(
        `Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
      );

      return compressedFile;
    } catch (error) {
      console.error('Image compression error:', error);
      throw error;
    }
  }

  // compress multiple images
  async compressImages(files: File[], options?: Partial<Options>): Promise<File[]> {
    const compressionPromises = files.map(file => this.compressImage(file, options));
    return Promise.all(compressionPromises);
  }

  // convert file to base64
  async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // get image dimensions
  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
}
