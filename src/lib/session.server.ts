// Tokens assinados (HMAC) para sessões de aluno e professor — sem e-mail.
const enc = new TextEncoder();

async function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET ausente");
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

export async function sha256(text: string) {
  const d = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPin(pseudonym: string, pin: string) {
  return sha256(`${process.env.SESSION_SECRET}:${pseudonym}:${pin}`);
}

export type Claims = { role: "student"; sid: string; p: string } | { role: "teacher" };

export async function signToken(claims: Claims, hours = 12) {
  const payload = btoa(JSON.stringify({ ...claims, exp: Date.now() + hours * 3600_000 }));
  const sig = await crypto.subtle.sign("HMAC", await key(), enc.encode(payload));
  return `${payload}.${b64(sig)}`;
}

export async function verifyToken(token: string | undefined): Promise<Claims | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = b64(await crypto.subtle.sign("HMAC", await key(), enc.encode(payload)));
  if (expected !== sig) return null;
  try {
    const c = JSON.parse(atob(payload));
    if (typeof c.exp !== "number" || c.exp < Date.now()) return null;
    return c as Claims;
  } catch {
    return null;
  }
}

export async function requireStudent(token: string) {
  const c = await verifyToken(token);
  if (!c || c.role !== "student") throw new Error("Sessão expirada. Entre novamente.");
  return c;
}
export async function requireTeacher(token: string) {
  const c = await verifyToken(token);
  if (!c || c.role !== "teacher") throw new Error("Acesso de professor necessário.");
  return c;
}
