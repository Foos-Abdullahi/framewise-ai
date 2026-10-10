import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const UPLOAD_COOKIE = "framewise-upload";
const lifetime = 30 * 60 * 1000;
function sign(value: string) {
  const secret = process.env.BLOB_READ_WRITE_TOKEN;
  if (!secret) throw new Error("Blob storage is not configured.");
  return createHmac("sha256", secret).update(value).digest("base64url");
}
export function createUploadSession() {
  const id = randomUUID();
  const payload = `${id}.${Date.now() + lifetime}`;
  return { id, cookie: `${payload}.${sign(payload)}` };
}
export function uploadSession(request: Request): string | null {
  try {
    const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${UPLOAD_COOKIE}=`))?.slice(UPLOAD_COOKIE.length + 1);
    if (!cookie) return null;
    const [id, expires, signature] = cookie.split(".");
    if (!/^[a-f0-9-]{36}$/.test(id) || !Number.isFinite(Number(expires)) || Number(expires) <= Date.now() || !signature) return null;
    const expected = Buffer.from(sign(`${id}.${expires}`));
    const actual = Buffer.from(signature);
    return expected.length === actual.length && timingSafeEqual(expected, actual) ? id : null;
  } catch { return null; }
}
export function ownsUpload(request: Request, pathname: unknown): pathname is string {
  const session = uploadSession(request);
  return !!session && typeof pathname === "string" && new RegExp(`^videos/${session}/[a-f0-9-]{36}\\.(mp4|mov|webm)$`).test(pathname);
}
