import { z } from "zod";

export const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
export const supportedVideoTypes = ["video/mp4", "video/quicktime", "video/webm"] as const;
export const youtubeUrlSchema = z.url().refine((value) => {
  const url = new URL(value);
  const host = url.hostname.replace(/^www\./, "");
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  const id = host === "youtu.be" ? url.pathname.slice(1) :
    ["youtube.com", "m.youtube.com"].includes(host) ?
      (url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)\/?$/)?.[1]) : null;
  return !!id && /^[\w-]{11}$/.test(id);
}, { message: "Enter a valid YouTube video URL." });

export const searchQuestionSchema = z.string().trim().max(1000, "Keep your search under 1,000 characters.");

export const analysisSchema = z.object({
  title: z.string(), summary: z.string(),
  timeline: z.array(z.object({ timestamp: z.string(), title: z.string(), description: z.string() })),
  entities: z.array(z.string()), insights: z.array(z.string()),
  searchResult: z.object({
    answer: z.string(),
    matches: z.array(z.object({
      timestamp: z.string(), seconds: z.number().int().nonnegative(), description: z.string(),
    })),
  }).nullable(),
});

