import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/minio.config";

export async function uploadImage(buffer: Buffer, key: string) {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.MINIO_BUCKET!,
      Key: key,
      Body: buffer,
    });
    await s3.send(command);
  } catch (err) {
    console.error("❌ Upload to MinIO failed:", err);
    throw err;
  }
}
