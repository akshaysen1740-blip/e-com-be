import sharp from "sharp";

export interface ProcessedImages {
    tiny: Buffer;
    thumbnail: Buffer;
    medium: Buffer;
    original: Buffer;
}

export async function processImage(
    buffer: Buffer
): Promise<ProcessedImages> {

    const tiny = await sharp(buffer)
        .resize(50, 50)
        .webp({ quality: 80 })
        .toBuffer();

    const thumbnail = await sharp(buffer)
        .resize(200, 200)
        .webp({ quality: 80 })
        .toBuffer();

    const medium = await sharp(buffer)
        .resize(600, 600)
        .webp({ quality: 85 })
        .toBuffer();

    const original = await sharp(buffer)
        .webp({ quality: 90 })
        .toBuffer();

    return {
        tiny,
        thumbnail,
        medium,
        original
    };
}