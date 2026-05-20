import { randomBytes } from "node:crypto";

import { loadConfig } from "../config/env";
import { getRedisClient } from "../redis/client";

function nonceKey(address: string): string {
  return `siwe:nonce:${address.trim().toLowerCase()}`;
}

export async function issueNonce(address: string): Promise<string> {
  const normalized = address.trim().toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
    throw new Error("Invalid wallet address");
  }

  const nonce = randomBytes(16).toString("hex");
  const config = loadConfig();
  const client = getRedisClient();

  await client.set(
    nonceKey(normalized),
    nonce,
    "EX",
    config.siwe.nonceTtlSeconds,
  );

  return nonce;
}

export async function consumeNonce(
  address: string,
  nonce: string,
): Promise<boolean> {
  const normalized = address.trim().toLowerCase();
  const client = getRedisClient();
  const key = nonceKey(normalized);
  const stored = await client.get(key);

  if (!stored || stored !== nonce) {
    return false;
  }

  await client.del(key);
  return true;
}
