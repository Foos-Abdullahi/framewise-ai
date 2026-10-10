import { z } from "zod";

export const youtubeUrlSchema = z.url().refine(
  (value) => {
    const hostname = new URL(value).hostname.replace(/^www\./, "");
    return hostname === "youtube.com" || hostname === "youtu.be";
  },
  { message: "Enter a valid YouTube URL." },
);

export const supportedVideoTypes = ["video/mp4", "video/quicktime", "video/webm"] as const;
