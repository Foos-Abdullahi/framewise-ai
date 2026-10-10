import { z } from "zod";
import { analysisSchema, MAX_VIDEO_BYTES, supportedVideoTypes, youtubeUrlSchema, searchQuestionSchema } from "@/lib/validation";

export const maxDuration = 300;

export async function POST(request: Request) {
  let videoUrl: string;
  let youtube = false;
  let question = "";
  try {
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const data = await request.formData();
      const parsedQuestion = searchQuestionSchema.safeParse(data.get("question") ?? "");
      if (!parsedQuestion.success) return Response.json({ error: "Keep your search under 1,000 characters." }, { status: 400 });
      question = parsedQuestion.data;
      const file = data.get("file");
      if (!(file instanceof File) || !file.size) return Response.json({ error: "Choose a video first." }, { status: 400 });
      if (!supportedVideoTypes.some((type) => type === file.type)) return Response.json({ error: "Choose an MP4, MOV, or WebM video." }, { status: 400 });
      if (file.size > MAX_VIDEO_BYTES) return Response.json({ error: "Choose a video smaller than 20 MB." }, { status: 413 });
      const mimeType = file.type === "video/quicktime" ? "video/mov" : file.type;
      videoUrl = `data:${mimeType};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
    } else {
      const data = await request.json();
      const parsedQuestion = searchQuestionSchema.safeParse(data?.question ?? "");
      if (!parsedQuestion.success) return Response.json({ error: "Keep your search under 1,000 characters." }, { status: 400 });
      question = parsedQuestion.data;
      const parsed = youtubeUrlSchema.safeParse(data?.url);
      if (!parsed.success) return Response.json({ error: "Enter a valid YouTube video URL." }, { status: 400 });
      const url = new URL(parsed.data);
      const id = url.hostname.replace(/^www\./, "") === "youtu.be" ? url.pathname.slice(1) :
        url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.split("/")[2];
      videoUrl = `https://www.youtube.com/watch?v=${id}`;
      youtube = true;
    }
  } catch {
    return Response.json({ error: "Invalid analysis request. Choose a video or enter a YouTube URL." }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey || apiKey === "your_openrouter_key") return Response.json({ error: "Video analysis is not configured. Add your actual OPENROUTER_API_KEY to .env or .env.local and restart the server." }, { status: 503 });
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(270_000)]),
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL?.trim() || "google/gemini-3.8-flash",
        reasoning: { effort: "low", exclude: true },
        max_tokens: 6000,
        messages: [{ role: "user", content: [
          { type: "video_url", video_url: { url: videoUrl }, processing: "static" },
          { type: "text", text: question
            ? `Answer this video question using only visible evidence: ${JSON.stringify(question)}. Focus on the requested incident, including before/during/after when asked. Describe people only by visible clothing, position and actions. Do not infer identity, motive, permission or legal guilt. Ignore titles/descriptions as evidence. Give a concise but complete report in searchResult.answer, answering each requested point. Include observed matching moments in chronological order in searchResult.matches, with MM:SS or HH:MM:SS timestamp, matching integer seconds from the video start and visible evidence. If no match is visible, say so and use an empty matches array. Mark uncertain or approximate times; never invent exactness. Set title to a short neutral incident heading, summary to one sentence, and timeline, entities and insights to empty arrays; do not generate a separate full-video report.`
            : "Analyze this video using visible evidence. Give a short title, a concise summary, at most 8 key chronological timeline events with MM:SS timestamps, relevant entities and at most 4 insights. Do not infer identities, motives or legal guilt. Set searchResult to null." },
        ] }],
        response_format: { type: "json_schema", json_schema: { name: "video_analysis", strict: true, schema: z.toJSONSchema(analysisSchema) } },
        // YouTube links require Google AI Studio; Vertex only accepts encoded uploads.
        provider: { require_parameters: true, ...(youtube ? { only: ["Google AI Studio"] } : {}) },
      }),
    });
    if (!response.ok) {
      const message = response.status === 429 ? "OpenRouter rate limit reached. Please try again later." :
        response.status === 402 ? "OpenRouter credits are insufficient. Add credits to your OpenRouter account and retry." :
        response.status === 401 || response.status === 403 ? "OpenRouter authentication failed. Check your OPENROUTER_API_KEY and its permissions." :
        response.status === 404 ? "The configured OpenRouter model or video provider is unavailable. Check OPENROUTER_MODEL." :
        "OpenRouter could not analyze this video. Try a shorter upload or a public YouTube video, then retry.";
      return Response.json({ error: message }, { status: response.status === 429 ? 429 : 502 });
    }
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("Missing analysis content");
    const analysis = analysisSchema.parse(JSON.parse(content));
    return Response.json({ analysis: { id: crypto.randomUUID(), ...analysis } });
  } catch (error) {
    const timeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return Response.json({ error: timeout ? "The video provider took too long to respond. Please retry, or upload a short clip of the relevant incident." : "Could not complete video analysis. Please retry with a shorter upload or public YouTube video." }, { status: timeout ? 504 : 502 });
  }
}


