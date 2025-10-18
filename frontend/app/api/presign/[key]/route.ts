import { NextRequest } from "next/server";
import { getPresignedUrl } from "@/lib/minio";

interface PresignParams {
  key: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<PresignParams> }
) {
  try {
    const { key } = await params;

    if (!key) {
      return Response.json({ error: "Key is required" }, { status: 400 });
    }

    const decodedKey = decodeURIComponent(key);
    const url = await getPresignedUrl(decodedKey);

    return Response.json({ url });
  } catch (err) {
    console.error("Failed to generate presigned URL:", err);
    return Response.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
