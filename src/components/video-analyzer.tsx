"use client";

import { useRef, useState } from "react";
import { ArrowRight, Link2, Upload, Video } from "lucide-react";

const acceptedTypes = ["video/mp4", "video/quicktime", "video/webm"];

export function VideoAnalyzer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "youtube">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function chooseFile(nextFile?: File) {
    if (!nextFile) return;
    if (!acceptedTypes.includes(nextFile.type)) {
      setError("Choose an MP4, MOV, or WebM video.");
      return;
    }
    setError("");
    setFile(nextFile);
  }

  return (
    <div className="mt-12 w-full max-w-4xl rounded-[28px] border border-white/10 bg-white/[.055] p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="rounded-[22px] bg-[#0d1915] p-5 sm:p-8">
        <div className="mb-6 flex gap-2 rounded-xl bg-black/20 p-1">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm transition ${mode === "upload" ? "bg-white/10 text-white" : "text-white/45 hover:text-white/70"}`}
          >
            <Upload className="size-4" /> Upload video
          </button>
          <button
            type="button"
            onClick={() => setMode("youtube")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm transition ${mode === "youtube" ? "bg-white/10 text-white" : "text-white/45 hover:text-white/70"}`}
          >
            <Link2 className="size-4" /> YouTube link
          </button>
        </div>

        {mode === "upload" ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              chooseFile(event.dataTransfer.files[0]);
            }}
            className="group flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[.025] px-5 transition hover:border-emerald-300/50 hover:bg-emerald-300/[.035]"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-300 transition group-hover:scale-105">
              <Video className="size-6" />
            </span>
            <span className="mt-5 font-medium">{file ? file.name : "Drop your video here"}</span>
            <span className="mt-2 text-sm text-white/40">
              {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB ready to upload` : "or click to browse · MP4, MOV, WebM"}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="hidden"
              onChange={(event) => chooseFile(event.target.files?.[0])}
            />
          </button>
        ) : (
          <div className="flex min-h-64 flex-col justify-center text-left">
            <label htmlFor="youtube-url" className="mb-2 text-sm text-white/60">
              YouTube video URL
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="youtube-url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="h-14 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none placeholder:text-white/25 focus:border-emerald-300/50"
              />
              <button
                type="button"
                disabled={!url}
                className="flex h-14 items-center justify-center gap-2 rounded-xl bg-emerald-300 px-6 font-medium text-[#07110e] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Analyze <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-left text-sm text-red-300">{error}</p>}
        {mode === "upload" && (
          <button
            type="button"
            disabled={!file}
            className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 font-medium text-[#07110e] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Analyze video <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
