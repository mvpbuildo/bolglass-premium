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
