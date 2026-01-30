import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 0.6, // 600KB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        onProgress: (progress: number) => {
            // You can pass a callback here if needed
        },
    };

    try {
        const compressedFile = await imageCompression(file, options);
        // If the compressed file is still larger than 600KB, we can't do much more without losing too much quality
        // but browser-image-compression is usually good at meeting the maxSizeMB target.

        // Maintain the original name
        return new File([compressedFile], file.name, {
            type: compressedFile.type,
            lastModified: Date.now(),
        });
    } catch (error) {
        console.error('Image compression error:', error);
        return file; // Return original if compression fails
    }
}
