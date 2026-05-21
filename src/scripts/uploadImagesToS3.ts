import fs from "fs";
import path from "path";
import mime from "mime-types";
import dotenv from "dotenv";
dotenv.config();

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3";

const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

const ROOT_FOLDER = path.join(process.cwd(), "assets/products");

const uploadFile = async (
  filePath: string,
  category: string,
  fileName: string,
) => {
  const fileContent = fs.readFileSync(filePath);

  const key = `products/${category}/${Date.now()}-${fileName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: mime.lookup(filePath) || "image/webp",
    }),
  );

  const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

  console.log("Uploaded:", url);

  return url;
};

const uploadAllImages = async () => {
  const categories = fs.readdirSync(ROOT_FOLDER);

  for (const category of categories) {
    const categoryPath = path.join(ROOT_FOLDER, category);

    const files = fs.readdirSync(categoryPath);

    for (const file of files) {
      const filePath = path.join(categoryPath, file);

      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        await uploadFile(filePath, category, file);
      }
    }
  }

  console.log("All images uploaded successfully");
};

uploadAllImages();
