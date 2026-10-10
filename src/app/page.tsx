import { Film } from "lucide-react";
import { VideoAnalyzer } from "@/components/video-analyzer";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07110e] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(60,224,156,.18),transparent_38%)]" />
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-400 text-[#07110e]">
            <Film className="size-5" />
          </span>
          <span>Framewise AI</span>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60">
          Private by design
        </span>
      </nav>

      <section className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-16 text-center lg:px-8 lg:pt-24">
        <div className="mb-6 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200">
          Video understanding, frame by frame
        </div>
        <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-7xl">
          Turn hours of video into
          <span className="text-emerald-300"> instant insight.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-white/55 sm:text-lg">
          Upload a video or paste a YouTube link. Framewise creates a concise summary,
          a searchable timeline, and the key moments that matter.
        </p>

        <VideoAnalyzer />

        <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-3 text-left text-sm text-white/55 sm:grid-cols-3">
          {[
            ["01", "Scene timeline", "Jump directly to important moments."],
            ["02", "Smart summary", "Understand the story in a few lines."],
            ["03", "Ask anything", "Get grounded answers about the video."],
          ].map(([number, title, description]) => (
            <article key={number} className="rounded-2xl border border-white/8 bg-white/[.035] p-5">
              <span className="font-mono text-xs text-emerald-300/70">{number}</span>
              <h2 className="mt-4 font-medium text-white">{title}</h2>
              <p className="mt-1 leading-6">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
