import nacl from "tweetnacl";
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from "tweetnacl-util";

const PRIVATE_KEY_STORAGE = "tg_private_key";
const PUBLIC_KEY_STORAGE  = "tg_public_key";

/** Generate + save key pair (call once at signup/login if not exists) */
export function ensureKeyPair() {
  if (localStorage.getItem(PRIVATE_KEY_STORAGE)) return getPublicKey();
  const pair = nacl.box.keyPair();
  localStorage.setItem(PRIVATE_KEY_STORAGE, encodeBase64(pair.secretKey));
  localStorage.setItem(PUBLIC_KEY_STORAGE,  encodeBase64(pair.publicKey));
  return encodeBase64(pair.publicKey);
}

export function getPublicKey() {
  return localStorage.getItem(PUBLIC_KEY_STORAGE);
}

function getPrivateKey() {
  const k = localStorage.getItem(PRIVATE_KEY_STORAGE);
  return k ? decodeBase64(k) : null;
}

/** Encrypt a message for a receiver (their publicKey as base64 string) */
export function encryptMessage(plaintext, receiverPublicKeyB64) {
  // ✅ Guard — agar receiver ki key nahi hai toh plaintext bhejo
  if (!receiverPublicKeyB64 || receiverPublicKeyB64.length < 10) {
    return plaintext;
  }

  // ✅ Guard — apni private key check karo
  const myPriv = getPrivateKey();
  if (!myPriv) return plaintext;

  try {
    const theirPub = decodeBase64(receiverPublicKeyB64);
    const nonce    = nacl.randomBytes(nacl.box.nonceLength);
    const box      = nacl.box(encodeUTF8(plaintext), nonce, theirPub, myPriv);

    // Pack nonce + ciphertext together as base64
    const combined = new Uint8Array(nonce.length + box.length);
    combined.set(nonce);
    combined.set(box, nonce.length);
    return encodeBase64(combined);
  } catch (e) {
    console.warn("encryptMessage failed, sending plaintext:", e.message);
    return plaintext;
  }
}

/** Decrypt a message received from a sender (their publicKey as base64 string) */
export function decryptMessage(ciphertextB64, senderPublicKeyB64) {
  // ✅ Guard — agar key nahi hai ya content already plaintext hai
  if (!senderPublicKeyB64 || senderPublicKeyB64.length < 10) {
    return ciphertextB64;
  }

  // ✅ Guard — apni private key check karo
  const myPriv = getPrivateKey();
  if (!myPriv) return ciphertextB64;

  try {
    const combined  = decodeBase64(ciphertextB64);
    const nonce     = combined.slice(0, nacl.box.nonceLength);
    const box       = combined.slice(nacl.box.nonceLength);
    const theirPub  = decodeBase64(senderPublicKeyB64);
    const decrypted = nacl.box.open(box, nonce, theirPub, myPriv);

    // ✅ Agar decrypt fail ho toh original content return karo
    return decrypted ? decodeUTF8(decrypted) : ciphertextB64;
  } catch {
    // ✅ Agar base64 decode fail ho (plaintext message) toh as-is return karo
    return ciphertextB64;
  }
}