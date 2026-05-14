import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3 } from "../../config/s3";


export const uploadToS3 = async (
  file: Express.Multer.File
) => {
  const fileName = `products/${Date.now()}-${
    file.originalname
  }`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};