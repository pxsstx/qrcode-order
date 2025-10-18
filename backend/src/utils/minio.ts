import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER || "minioadmin",
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin",
  },
  forcePathStyle: true, // สำคัญสำหรับ MinIO
});

export async function getPresignedUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.MINIO_BUCKET || "menus",
    Key: key,
  });

  // กำหนดหมดอายุ (1 วัน)
  return await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 24 });
}
