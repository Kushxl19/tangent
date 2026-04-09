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
  const theirPub = decodeBase64(receiverPublicKeyB64);
  const myPriv   = getPrivateKey();
  const nonce    = nacl.randomBytes(nacl.box.nonceLength);
  const box      = nacl.box(encodeUTF8(plaintext), nonce, theirPub, myPriv);

  // Pack nonce + ciphertext together as base64
  const combined = new Uint8Array(nonce.length + box.length);
  combined.set(nonce);
  combined.set(box, nonce.length);
  return encodeBase64(combined);
}

/** Decrypt a message received from a sender (their publicKey as base64 string) */
export function decryptMessage(ciphertextB64, senderPublicKeyB64) {
  try {
    const combined  = decodeBase64(ciphertextB64);
    const nonce     = combined.slice(0, nacl.box.nonceLength);
    const box       = combined.slice(nacl.box.nonceLength);
    const theirPub  = decodeBase64(senderPublicKeyB64);
    const myPriv    = getPrivateKey();
    const decrypted = nacl.box.open(box, nonce, theirPub, myPriv);
    return decrypted ? decodeUTF8(decrypted) : "🔐 [Unable to decrypt]";
  } catch {
    return "🔐 [Unable to decrypt]";
  }
}