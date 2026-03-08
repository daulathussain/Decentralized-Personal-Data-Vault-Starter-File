export const ENCRYPTION_VERSION = "AES-GCM-256-v1";

export interface EncryptedPayload {
  version: string;
  iv: string;
  salt: string;
  ciphertext: string;
  authTag?: string;
}

export interface EncryptionResult {
  encryptedFile: Blob;
  encryptedKey: string;
  iv: string;
  salt: string;
}

function generateSecureRandom(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

async function deriveKey(password: Uint8Array, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    password,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 310000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptFile(file: File): Promise<EncryptionResult> {
  const rawKey = generateSecureRandom(32);
  const iv = generateSecureRandom(12);
  const salt = generateSecureRandom(32);

  const aesKey = await deriveKey(rawKey, salt);

  const fileBuffer = await file.arrayBuffer();
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    fileBuffer
  );

  const encryptedFile = new Blob([encryptedBuffer], { type: "application/octet-stream" });

  const exportedKey = await crypto.subtle.exportKey("raw", aesKey);
  const encryptedKey = Buffer.from(new Uint8Array(exportedKey)).toString("base64");

  return {
    encryptedFile,
    encryptedKey,
    iv: Buffer.from(iv).toString("base64"),
    salt: Buffer.from(salt).toString("base64"),
  };
}

export async function decryptFile(
  encryptedBlob: Blob,
  encryptedKey: string,
  ivBase64: string
): Promise<ArrayBuffer> {
  const keyBuffer = Buffer.from(encryptedKey, "base64");
  const iv = Buffer.from(ivBase64, "base64");

  const aesKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const encryptedBuffer = await encryptedBlob.arrayBuffer();

  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encryptedBuffer
  );
}

export async function encryptKeyWithWallet(
  rawKey: string,
  walletAddress: string,
  signMessage: (message: string) => Promise<string>
): Promise<string> {
  const message = `DataVault Key Encryption: ${walletAddress.toLowerCase()}`;
  const signature = await signMessage(message);

  const sigBytes = Buffer.from(signature.slice(2), "hex");
  const salt = generateSecureRandom(32);
  const iv = generateSecureRandom(12);

  const derivedKey = await deriveKey(sigBytes.subarray(0, 32), salt);

  const keyBytes = Buffer.from(rawKey, "base64");
  const encryptedKeyBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    keyBytes
  );

  const payload: EncryptedPayload = {
    version: ENCRYPTION_VERSION,
    iv: Buffer.from(iv).toString("base64"),
    salt: Buffer.from(salt).toString("base64"),
    ciphertext: Buffer.from(new Uint8Array(encryptedKeyBuffer)).toString("base64"),
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export async function decryptKeyWithWallet(
  encryptedKeyPayload: string,
  walletAddress: string,
  signMessage: (message: string) => Promise<string>
): Promise<string> {
  const payload: EncryptedPayload = JSON.parse(
    Buffer.from(encryptedKeyPayload, "base64").toString("utf-8")
  );

  const message = `DataVault Key Encryption: ${walletAddress.toLowerCase()}`;
  const signature = await signMessage(message);

  const sigBytes = Buffer.from(signature.slice(2), "hex");
  const salt = Buffer.from(payload.salt, "base64");
  const iv = Buffer.from(payload.iv, "base64");
  const ciphertext = Buffer.from(payload.ciphertext, "base64");

  const derivedKey = await deriveKey(sigBytes.subarray(0, 32), salt);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    ciphertext
  );

  return Buffer.from(new Uint8Array(decryptedBuffer)).toString("base64");
}

export function computeFileHash(content: ArrayBuffer): string {
  const view = new Uint8Array(content);
  let hash = 0;
  for (let i = 0; i < view.length; i++) {
    hash = (Math.imul(31, hash) + view[i]) | 0;
  }
  return "0x" + Math.abs(hash).toString(16).padStart(64, "0");
}

export async function computeFileSHA256(content: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", content);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
