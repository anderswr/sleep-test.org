// lib/id.ts
export function generateId(length = 11): string {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-";
  let out = "";
  const cryptoObj = globalThis.crypto || (require?.("crypto") as any)?.webcrypto;
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(length);
    cryptoObj.getRandomValues(bytes);
    for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  } else {
    for (let i = 0; i < length; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
