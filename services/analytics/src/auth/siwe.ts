import { verifyMessage } from "ethers";

import { loadConfig } from "../config/env";
import { consumeNonce } from "./nonce";

const ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/;

export function buildSiweMessage(address: string, nonce: string): string {
  const config = loadConfig();
  const normalized = address.trim();

  return (
    `${config.siwe.domain} wants you to sign in with your Ethereum account:\n` +
    `${normalized}\n\n` +
    `Sign in to AegisFlow Analytics Core.\n\n` +
    `URI: ${config.siwe.uri}\n` +
    `Version: 1\n` +
    `Chain ID: 1\n` +
    `Nonce: ${nonce}\n` +
    `Issued At: ${new Date().toISOString()}`
  );
}

export function extractAddressFromMessage(message: string): string | null {
  const match = message.match(ADDRESS_REGEX);
  return match?.[0] ?? null;
}

export function extractNonceFromMessage(message: string): string | null {
  const match = message.match(/Nonce:\s*([^\n]+)/i);
  return match?.[1]?.trim() ?? null;
}

export async function verifySiweSignature(
  message: string,
  signature: string,
): Promise<{ address: string }> {
  const address = extractAddressFromMessage(message);
  const nonce = extractNonceFromMessage(message);

  if (!address || !nonce) {
    throw new Error("Invalid SIWE message format");
  }

  const nonceValid = await consumeNonce(address, nonce);
  if (!nonceValid) {
    throw new Error("Invalid or expired nonce");
  }

  const recovered = verifyMessage(message, signature);
  if (recovered.toLowerCase() !== address.toLowerCase()) {
    throw new Error("Signature verification failed");
  }

  return { address: recovered };
}
