"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Link2, LoaderCircle, Search, Upload, Video } from "lucide-react";
import { analysisSchema, MAX_VIDEO_BYTES, supportedVideoTypes, youtubeUrlSchema, searchQuestionSchema } from "@/lib/validation";
import { MomentWorkspace } from "@/components/moment-workspace";
import { youtubeVideoId } from "@/lib/video";
import type { VideoAnalysis } from "@/types/analysis";

export function VideoAnalyzer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const [mode, setMode] = useState<"upload" | "youtube">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [localUrl, setLocalUrl] = useState("");
  const localUrlRef = useRef("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    if (!loading) return;
    const started = Date.now();
    const timer = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [loading]);
  useEffect(() => () => { abortRef.current?.abort(); if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current); }, []);

  function chooseFile(nextFile?: File) {
    if (!nextFile || busyRef.current) return;
    setAnalysis(null);
    if (!supportedVideoTypes.some((type) => type === nextFile.type) || !nextFile.size || nextFile.size > MAX_VIDEO_BYTES) {
      setFile(null);
      if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
      localUrlRef.current = "";
      setLocalUrl("");
      setError("Choose a non-empty MP4, MOV, or WebM video up to 20 MB.");
      return;
    }
    setError("");
    if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    localUrlRef.current = URL.createObjectURL(nextFile);
    setLocalUrl(localUrlRef.current);
    setFile(nextFile);
  }

  function switchMode(nextMode: "upload" | "youtube") {
    if (nextMode === mode) return;
    setMode(nextMode);
    setError("");
    setAnalysis(null);
  }

  async function analyze() {
    if (busyRef.current) return;
    setError("");
    setAnalysis(null);
    if (mode === "upload" && !file) { setError("Choose a video first."); return; }
    if (mode === "youtube" && !youtubeUrlSchema.safeParse(url.trim()).success) {
      setError("Enter a valid YouTube video URL."); return;
    }
    const parsedQuestion = searchQuestionSchema.safeParse(question);
    if (!parsedQuestion.success) { setError("Keep your search under 1,000 characters."); return; }
    busyRef.current = true;
    setSubmittedQuestion(parsedQuestion.data);
    setElapsedSeconds(0);
    const controller = new AbortController();
    abortRef.current = controller;
    setUploadProgress(null);
    setLoading(true);
    try {
      const body = new FormData();
      if (file) body.append("file", file);
      body.append("question", parsedQuestion.data);
      let blobPathname: string | null = null;
      if (mode === "upload" && file) {
        const configResponse = await fetch("/api/upload", { signal: controller.signal });
        if (!configResponse.ok) throw new Error("Could not prepare video upload. Please retry.");
        const config = await configResponse.json();
        if (config.enabled) {
          setUploadProgress(0);
          const extension = file.type === "video/quicktime" ? "mov" : file.type === "video/webm" ? "webm" : "mp4";
          const blob = await upload(`${config.prefix}/${crypto.randomUUID()}.${extension}`, file, {
            access: "private", handleUploadUrl: "/api/upload", contentType: file.type,
            abortSignal: controller.signal, onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
          });
          blobPathname = blob.pathname;
          setUploadProgress(null);
        } else if (config.hosted) throw new Error("Video uploads are not configured. Connect a private Vercel Blob store to this project.");
      }
      const response = await fetch("/api/analyze", {
        method: "POST",
        ...(mode === "upload" && !blobPathname ? { body } : { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(blobPathname ? { blobPathname } : { url: url.trim() }), question: parsedQuestion.data }) }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(290_000)]),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || (response.status === 413 ? "This upload is too large for the server. Try a smaller video." : "Analysis failed. Please try again."));
      const parsed = analysisSchema.safeParse(data?.analysis);
      if (!parsed.success) throw new Error("The analysis service returned an invalid result. Please retry.");
      setAnalysis({ id: data.analysis.id, ...parsed.data });
      setSubmittedQuestion(parsedQuestion.data);

    } catch (error) {
      setError(error instanceof Error && error.name === "AbortError" ? "Analysis canceled." : error instanceof Error && error.name === "TimeoutError" ? "Analysis timed out. Try a shorter video." : error instanceof Error ? error.message : "Unable to connect. Please try again.");
    } finally {
      abortRef.current = null;
      busyRef.current = false;
      setUploadProgress(null);
      setLoading(false);
    }
  }

  const youtubeId = mode === "youtube" ? youtubeVideoId(url.trim()) : null;
  const hasVideo = mode === "youtube" ? !!youtubeId : !!localUrl;
  return (
    <div className="w-full text-left">
      <form onSubmit={(event) => { event.preventDefault(); void analyze(); }} aria-busy={loading} className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="text-xs font-medium uppercase tracking-[.16em] text-muted-foreground">01 / Choose your video</span>
            <div className="flex gap-1 rounded-lg bg-secondary p-1">
              <button type="button" disabled={loading} onClick={() => switchMode("upload")} aria-pressed={mode === "upload"} className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${mode === "upload" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}><Upload className="size-3.5" />Upload</button>
              <button type="button" disabled={loading} onClick={() => switchMode("youtube")} aria-pressed={mode === "youtube"} className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${mode === "youtube" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}><Link2 className="size-3.5" />YouTube link</button>
            </div>
          </div>
          <input ref={inputRef} type="file" accept={supportedVideoTypes.join(",")} className="hidden" disabled={loading} onChange={(event) => { chooseFile(event.target.files?.[0]); event.target.value = ""; }} />
          {mode === "upload" ? <button type="button" disabled={loading} onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files[0]); }} className="flex min-h-24 w-full items-center justify-center gap-4 rounded-xl border border-dashed border-input bg-background px-5 py-5 transition hover:border-primary">
            <Video className="size-7 shrink-0 text-primary" /><span className="min-w-0"><span className="block break-all text-sm font-medium">{file ? file.name : "Drop a video here or browse files"}</span><span className="mt-1 block text-xs text-muted-foreground">{file ? "Click to change video" : "MP4, MOV, WebM · up to 20 MB"}</span></span>
          </button> : <div><label htmlFor="youtube-url" className="sr-only">Public YouTube video URL</label><input id="youtube-url" type="url" value={url} disabled={loading} onChange={(event) => { setUrl(event.target.value); setError(""); setAnalysis(null); }} placeholder="Paste a public YouTube video URL…" className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary" /></div>}
        </div>

        {hasVideo && <MomentWorkspace key={`${mode}-${youtubeId ?? localUrl}-${analysis?.id ?? "preview"}`} youtubeId={youtubeId} localUrl={localUrl} sourceName={mode === "upload" ? file?.name ?? "Uploaded video" : "YouTube video"} question={loading || analysis ? submittedQuestion : ""} loading={loading} elapsed={elapsedSeconds} uploadProgress={uploadProgress} analysis={analysis} onCancel={() => abortRef.current?.abort()} />}

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <label htmlFor="video-question" className="flex items-center gap-2 text-sm font-semibold"><Search className="size-4 text-orange-500" />What do you want to find in this video?</label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <textarea id="video-question" value={question} disabled={loading} maxLength={1000} rows={2} onChange={(event) => { setQuestion(event.target.value); setError(""); }} placeholder="Find the moment when someone picks up the bag…" aria-describedby="question-help" className="min-w-0 flex-1 resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary" />
            <button type="submit" disabled={loading || !hasVideo} className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">{loading ? <><LoaderCircle className="size-4 animate-spin" />Scanning…</> : <>Find moments<ArrowRight className="size-4" /></>}</button>
          </div>
          <p id="question-help" className="mt-3 text-xs text-muted-foreground">Describe a moment, or leave blank to find the video’s highlights.</p>
          {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      </form>
    </div>
  );
}


