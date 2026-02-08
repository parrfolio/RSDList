import type { Area } from 'react-easy-crop';

/** Convert a File to a data URL for the cropper preview */
export function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/** Crop an image data URL to the given pixel area, returning a Blob */
export async function getCroppedBlob(imageSrc: string, crop: Area): Promise<Blob> {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    await new Promise<void>((res, rej) => {
        image.onload = () => res();
        image.onerror = rej;
        image.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const size = Math.min(crop.width, crop.height);
    // Output a 512×512 avatar
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, crop.x, crop.y, size, size, 0, 0, 512, 512);

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
            'image/jpeg',
            0.9
        );
    });
}
