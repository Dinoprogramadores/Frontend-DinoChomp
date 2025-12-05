// ===== Utilidades Base64 =====
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const b64ToBuf = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));

// ===== Clave =====
const SECRET = "MY_SUPER_SECRET_KEY_32_BYTES_1234";

// ===== Genera clave AES =====
async function getAesKey() {
  const raw = new TextEncoder().encode(SECRET);
  return crypto.subtle.importKey(
    "raw",
    raw.slice(0, 32),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
}

// ===== IV aleatorio =====
const randomIV = () => crypto.getRandomValues(new Uint8Array(12));

// ===== CIFRAR =====
export async function encryptJSON(obj){
  const key = await getAesKey();
  const iv = randomIV();
  const plaintext = new TextEncoder().encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);

  return JSON.stringify({
    iv: b64(iv),
    ciphertext: b64(ct)
  });
}

// ===== DESCIFRAR =====
// 🔥 CRÍTICO: Acepta tanto string como objeto
export async function decryptJSON(payload){
  const key = await getAesKey();
  
  // Si payload es string, parsearlo. Si ya es objeto, usarlo directamente
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
  
  const { iv, ciphertext } = data;
  const ivBuf = b64ToBuf(iv);
  const ctBuf = b64ToBuf(ciphertext).buffer;

  const pt = await crypto.subtle.decrypt(
    { name:"AES-GCM", iv: ivBuf },
    key,
    ctBuf
  );

  return JSON.parse(new TextDecoder().decode(pt));
}