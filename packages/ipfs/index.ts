import FormData from "form-data";

export interface PinataConfig {
  apiKey: string;
  apiSecret: string;
  jwt: string;
  gateway: string;
}

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

export interface IPFSFile {
  cid: string;
  size: number;
  timestamp: string;
  url: string;
}

const PINATA_API_BASE = "https://api.pinata.cloud";

function getPinataHeaders(config: PinataConfig): Record<string, string> {
  return {
    Authorization: `Bearer ${config.jwt}`,
  };
}

export async function uploadFileToPinata(
  encryptedBlob: Blob,
  fileName: string,
  config: PinataConfig,
  metadata?: Record<string, string>
): Promise<IPFSFile> {
  const formData = new FormData();

  const arrayBuffer = await encryptedBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  formData.append("file", buffer, {
    filename: `encrypted_${fileName}`,
    contentType: "application/octet-stream",
  });

  const pinataMetadata = JSON.stringify({
    name: `encrypted_${fileName}`,
    keyvalues: {
      encrypted: "true",
      originalName: fileName,
      ...metadata,
    },
  });
  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  });
  formData.append("pinataOptions", pinataOptions);

  const response = await fetch(`${PINATA_API_BASE}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: {
      ...getPinataHeaders(config),
      ...formData.getHeaders(),
    },
    body: formData as unknown as BodyInit,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} - ${error}`);
  }

  const result: PinataResponse = await response.json();

  return {
    cid: result.IpfsHash,
    size: result.PinSize,
    timestamp: result.Timestamp,
    url: `${config.gateway}/ipfs/${result.IpfsHash}`,
  };
}

export async function fetchFromIPFS(cid: string, config: PinataConfig): Promise<ArrayBuffer> {
  const url = `${config.gateway}/ipfs/${cid}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.jwt}`,
    },
  });

  if (!response.ok) {
    throw new Error(`IPFS fetch failed: ${response.status}`);
  }

  return response.arrayBuffer();
}

export async function unpinFromIPFS(cid: string, config: PinataConfig): Promise<void> {
  const response = await fetch(`${PINATA_API_BASE}/pinning/unpin/${cid}`, {
    method: "DELETE",
    headers: getPinataHeaders(config),
  });

  if (!response.ok) {
    throw new Error(`Pinata unpin failed: ${response.status}`);
  }
}

export async function testPinataConnection(config: PinataConfig): Promise<boolean> {
  try {
    const response = await fetch(`${PINATA_API_BASE}/data/testAuthentication`, {
      method: "GET",
      headers: getPinataHeaders(config),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function buildIPFSUrl(cid: string, gateway: string): string {
  return `${gateway}/ipfs/${cid}`;
}
