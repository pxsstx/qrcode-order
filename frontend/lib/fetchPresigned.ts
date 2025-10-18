export async function fetchPresignedUrl(key: string): Promise<string> {
  try {
    const encodedKey = encodeURIComponent(key); // ต้อง encode ก่อนส่ง
    const res = await fetch(`/api/presign/${encodedKey}`);
    if (!res.ok)
      throw new Error(`Failed to fetch presigned URL: ${res.statusText}`);
    const data = await res.json();
    return data.url;
  } catch (err) {
    console.error("fetchPresignedUrl error:", err);
    return ""; // ถ้า fail ให้ return empty
  }
}
