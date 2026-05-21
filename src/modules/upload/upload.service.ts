import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../config/s3";
import { processImage } from "../../utills/imageProcessor";

export const uploadToS3 = async (
  buffer: Buffer,
  fileName: string,
  contentType: string = "image/webp",
) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

export async function uploadProductImages(file: Express.Multer.File) {
  const imageRecords = [];

  const processed = await processImage(file.buffer);

  const timestamp = Date.now();

  const basePath = `products/`;

  const tinyKey = `${basePath}/tiny/${timestamp}.webp`;

  const thumbnailKey = `${basePath}/thumbnail/${timestamp}.webp`;

  const mediumKey = `${basePath}/medium/${timestamp}.webp`;

  const originalKey = `${basePath}/original/${timestamp}.webp`;

  const [tinyUrl, thumbnailUrl, mediumUrl, originalUrl] = await Promise.all([
    uploadToS3(processed.tiny, tinyKey, "image/webp"),

    uploadToS3(processed.thumbnail, thumbnailKey, "image/webp"),

    uploadToS3(processed.medium, mediumKey, "image/webp"),

    uploadToS3(processed.original, originalKey, "image/webp"),
  ]);

  return {
    original_url: originalUrl,
    medium_url: mediumUrl,
    thumbnail_url: thumbnailUrl,
    tiny_url: tinyUrl,
    is_primary: imageRecords.length === 0,
  }

}
