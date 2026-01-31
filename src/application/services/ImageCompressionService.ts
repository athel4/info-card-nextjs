export class ImageCompressionService {
  static compressImage(file: File, maxWidth = 700, maxHeight = 700, quality = 0.4): Promise<File> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          image.src = e.target.result as string;
        }
      };

      reader.onerror = reject;
      image.onerror = reject;

      image.onload = () => {
        let { width, height } = image;

        // Skip resize if already within limits
        if (width <= maxWidth && height <= maxHeight) {
          return resolve(file); // return original file
        }

        // Scale down while preserving aspect ratio
        const aspectRatio = width / height;
        if (width > height) {
          if (width > maxWidth) {
            width = maxWidth;
            height = Math.round(width / aspectRatio);
          }
        } else {
          if (height > maxHeight) {
            height = maxHeight;
            width = Math.round(height * aspectRatio);
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(image, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Create a new File object from the compressed blob
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Image compression failed"));
              }
            },
            "image/jpeg",
            quality
          );
        } else {
          reject(new Error("Canvas context not available"));
        }
      };

      reader.readAsDataURL(file);
    });
  }

  static async compressFiles(files: File[]): Promise<File[]> {
    const compressionPromises = files.map(file => this.compressImage(file));
    return Promise.all(compressionPromises);
  }
}