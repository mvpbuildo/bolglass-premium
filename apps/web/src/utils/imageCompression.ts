/**
 * Compresses a base64 dataURL (image/png or image/jpeg) using the browser's Canvas API.
 * Returns a promise that resolves with a compressed JPEG dataURL.
 */
export async function compressDataURL(dataUrl: string, maxWidth = 800, maxWeight = 800, quality = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxWeight) {
                    width = Math.round((width * maxWeight) / height);
                    height = maxWeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            ctx.fillStyle = 'white'; // Avoid black background for transparent PNGs
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            const result = canvas.toDataURL('image/jpeg', quality);
            resolve(result);
        };
        img.onerror = (err) => reject(err);
        img.src = dataUrl;
    });
}

/**
 * Compresses an image File using the browser's Canvas API.
 * Returns a promise that resolves with a compressed JPEG File object.
 */
export async function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (event) => {
            const dataUrl = event.target?.result as string;
            try {
                const compressedDataUrl = await compressDataURL(dataUrl, maxWidth, maxHeight, quality);

                // Convert back to File
                const res = await fetch(compressedDataUrl);
                const blob = await res.blob();
                const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });

                resolve(newFile);
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = (err) => reject(err);
    });
}
