// src/utils/compressor.js
import pako from "pako";

// 압축 + URL-safe Base64 인코딩
export function compressAndEncode(inputStr) {
  const utf8Bytes = new TextEncoder().encode(inputStr);
  const compressed = pako.deflate(utf8Bytes);
  const base64 = btoa(String.fromCharCode(...compressed));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// 복원
export function decodeAndDecompress(base64Str) {
  const base64 = base64Str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  const binary = atob(padded);
  const byteArray = new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
  const decompressed = pako.inflate(byteArray);
  return new TextDecoder().decode(decompressed);
}
