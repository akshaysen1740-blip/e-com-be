import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../config/s3";
import { processImage } from "../../utills/imageProcessor";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";


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

  const basePath = `products`;

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

// "https://shwetaarts-products-094005227192-ap-south-1-an.s3.ap-south-1.amazonaws.com/products//medium/1779569906820.webp"

export const deleteFromS3 = async (urls: string[]) => {
  if (!urls.length) return;

  const bucketName = process.env.AWS_BUCKET_NAME!;

  const objects = urls
    .filter(Boolean)
    .map((url) => {
      const key = url.split(".amazonaws.com/")[1];

      return { Key: key };
    });

  if (!objects.length) return;

  await s3.send(
    new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: objects,
      },
    }),
  );
};
