// src/utils/compressor.js
import pako from "pako";

// 압축 + Base64 + URI 인코딩
export function compressAndEncode(inputStr) {
  const utf8Bytes = new TextEncoder().encode(inputStr);
  const compressed = pako.deflate(utf8Bytes);
  const base64 = btoa(String.fromCharCode(...compressed));
  return encodeURIComponent(base64);
}

// URI 디코딩 + Base64 + 압축 복원
export function decodeAndDecompress(encodedStr) {
  try {
    const base64 = decodeURIComponent(encodedStr);
    const binary = atob(base64);
    const byteArray = new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
    const decompressed = pako.inflate(byteArray);
    return new TextDecoder().decode(decompressed);
  } catch (ignore) {
    // Legacy/plain filenames can reach here; return original value silently.
    return encodedStr;
  }
}
