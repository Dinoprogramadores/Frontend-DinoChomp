// ===== Utilidades Base64 =====
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const b64ToBuf = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));

// ===== Clave compartida =====
const SECRET = "MY_SUPER_SECRET_KEY_32_BYTES_1234";

// Convierte string -> key AES
async function getAesKey() {
  const raw = new TextEncoder().encode(SECRET);
  return crypto.subtle.importKey("raw", raw.slice(0, 32), "AES-GCM", false, ["encrypt","decrypt"]);
}

// Genera IV (12 bytes recomendado)
const randomIV = () => crypto.getRandomValues(new Uint8Array(12));

// ===== CIFRAR =====
export async function encryptJSON(obj){
  const key = await getAesKey();
  const iv = randomIV();
  const plaintext = new TextEncoder().encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name:"AES-GCM", iv }, key, plaintext);
  return { iv: b64(iv), ciphertext: b64(ct) };
}

// ===== DESCIFRAR (si necesitas recibir datos cifrados) =====
export async function decryptJSON(ivB64, ctB64){
  const key = await getAesKey();
  const iv = b64ToBuf(ivB64);
  const ct = b64ToBuf(ctB64).buffer;
  const pt = await crypto.subtle.decrypt({ name:"AES-GCM", iv }, key, ct);
  return JSON.parse(new TextDecoder().decode(pt));
}
