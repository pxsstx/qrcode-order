import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.MINIO_BUCKET || "menus";

export const s3 = new S3Client({
  region: "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true, // important for MinIO
});

/**
 * Returns a presigned URL for an object in MinIO.
 * @param key object key (filename)
 */
export async function getPresignedUrl(key?: string) {
  if (!key) return null; // do not throw, just return null
  if (!BUCKET) throw new Error("MINIO_BUCKET is not defined");

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3, command, {
      expiresIn: 60 * 60,
    }); // 1 hour
    return url;
  } catch (err) {
    console.error("Failed to generate presigned URL:", err);
    return null;
  }
}
