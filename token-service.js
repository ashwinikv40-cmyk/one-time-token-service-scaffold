// token-service.js
// A single-use, expiring token service backed by Redis.
//
// You implement the two functions below. The lesson walks through the exact
// pattern — this file is just the shape to fill in.


import crypto from "node:crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

// Helper: build the Redis key for a token id.
const keyFor = (id) => "token:" + id;

export async function issueToken(payload, ttlSeconds) {
  const id = crypto.randomBytes(16).toString("hex");
  const value = JSON.stringify(payload);

  await redis.set(keyFor(id), value, "EX", ttlSeconds, "NX");

  return id;
}

export async function consumeToken(tokenId) {
  const value = await redis.getdel(keyFor(tokenId));

  if (value === null) {
    return { ok: false, reason: "invalid" };
  }

  return {
    ok: true,
    payload: JSON.parse(value),
  };
}

export function closeRedis() {
  return redis.quit();
}
