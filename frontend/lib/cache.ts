import redisClient from "@/lib/redis";

export async function withCache(
  key: string,
  fetcher: () => Promise<any>,
  ttl = 60
) {
  // 1. เช็ค cache
  const cached = await redisClient.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. ถ้าไม่มี cache → เรียก fetcher
  const data = await fetcher();

  // 3. บันทึก cache
  await redisClient.setEx(key, ttl, JSON.stringify(data));

  return data;
}
