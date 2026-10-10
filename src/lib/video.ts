export function youtubeVideoId(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (!["https:", "http:"].includes(url.protocol)) return null;
    const id = host === "youtu.be" ? url.pathname.slice(1) :
      ["youtube.com", "m.youtube.com"].includes(host) ?
        url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)\/?$/)?.[1] : null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}

export function formatVideoTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  return [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60]
    .map((part) => String(part).padStart(2, "0")).join(":");
}

export function timestampSeconds(timestamp: string): number {
  const parts = timestamp.split(":").map(Number);
  return parts.length >= 2 && parts.length <= 3 && parts.every((part) => Number.isFinite(part) && part >= 0)
    ? parts.reduce((total, part) => total * 60 + part, 0) : 0;
}
