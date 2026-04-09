import nacl from "tweetnacl";

const PRIVATE_KEY_STORAGE = "tg_private_key";
const PUBLIC_KEY_STORAGE  = "tg_public_key";

// ── Helpers: native browser base64 ──────────────────────────────
function toBase64(uint8) {
  return btoa(String.fromCharCode(...uint8));
}

function fromBase64(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

function strToUint8(str) {
  return new TextEncoder().encode(str);
}

function uint8ToStr(uint8) {
  return new TextDecoder().decode(uint8);
}

// ── Key management ───────────────────────────────────────────────

/** Generate + save key pair (call once at login/signup) */
export function ensureKeyPair() {
  if (localStorage.getItem(PRIVATE_KEY_STORAGE)) return getPublicKey();
  const pair = nacl.box.keyPair();
  localStorage.setItem(PRIVATE_KEY_STORAGE, toBase64(pair.secretKey));
  localStorage.setItem(PUBLIC_KEY_STORAGE,  toBase64(pair.publicKey));
  return toBase64(pair.publicKey);
}

export function getPublicKey() {
  return localStorage.getItem(PUBLIC_KEY_STORAGE);
}

function getPrivateKey() {
  const k = localStorage.getItem(PRIVATE_KEY_STORAGE);
  if (!k) return null;
  return fromBase64(k);
}

// ── Encrypt ─────────────────────────────────────────────────────

export function encryptMessage(plaintext, receiverPublicKeyB64) {
  if (!receiverPublicKeyB64 || receiverPublicKeyB64.length < 10) return plaintext;

  const myPriv = getPrivateKey();
  if (!myPriv) return plaintext;

  try {
    const theirPub = fromBase64(receiverPublicKeyB64);
    const nonce    = nacl.randomBytes(nacl.box.nonceLength);
    const message  = strToUint8(plaintext);
    const box      = nacl.box(message, nonce, theirPub, myPriv);

    if (!box) return plaintext;

    const combined = new Uint8Array(nonce.length + box.length);
    combined.set(nonce);
    combined.set(box, nonce.length);
    return toBase64(combined);
  } catch (e) {
    console.warn("encryptMessage failed, sending plaintext:", e.message);
    return plaintext;
  }
}

// ── Decrypt ─────────────────────────────────────────────────────

export function decryptMessage(ciphertextB64, senderPublicKeyB64) {
  if (!senderPublicKeyB64 || senderPublicKeyB64.length < 10) return ciphertextB64;

  const myPriv = getPrivateKey();
  if (!myPriv) return ciphertextB64;

  try {
    const combined  = fromBase64(ciphertextB64);
    const nonce     = combined.slice(0, nacl.box.nonceLength);
    const box       = combined.slice(nacl.box.nonceLength);
    const theirPub  = fromBase64(senderPublicKeyB64);
    const decrypted = nacl.box.open(box, nonce, theirPub, myPriv);

    return decrypted ? uint8ToStr(decrypted) : ciphertextB64;
  } catch {
    return ciphertextB64;
  }
}