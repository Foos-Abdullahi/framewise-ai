"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown, Film, LoaderCircle, Play, ScanLine, Square, Target } from "lucide-react";
import { formatVideoTime, timestampSeconds } from "@/lib/video";
import type { VideoAnalysis } from "@/types/analysis";

type Props = {
  youtubeId: string | null;
  localUrl: string;
  sourceName: string;
  question: string;
  loading: boolean;
  elapsed: number;
  analysis: VideoAnalysis | null;
  onCancel: () => void;
};

export function MomentWorkspace({ youtubeId, localUrl, sourceName, question, loading, elapsed, analysis, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerError, setPlayerError] = useState("");
  const [seekVersion, setSeekVersion] = useState(0);
  const moments = (analysis?.searchResult?.matches ?? analysis?.timeline.map((event) => ({
    timestamp: event.timestamp, seconds: timestampSeconds(event.timestamp), description: event.description,
  })) ?? []).slice().sort((a, b) => a.seconds - b.seconds);
  const active = selected === null ? null : moments[selected];
  const rangeEnd = Math.max(duration, ...moments.map((moment) => moment.seconds), 1);
  const selectedTime = youtubeId ? active?.seconds ?? 0 : currentTime;

  function seek(index: number) {
    const moment = moments[index];
    setSelected(index);
    setSeekVersion((version) => version + 1);
    if (videoRef.current) {
      videoRef.current.currentTime = moment.seconds;
      setCurrentTime(moment.seconds);
      void videoRef.current.play().catch(() => setPlayerError("Press play in the video to continue."));
    }
  }

  return <section aria-label="Moment finder workspace" className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-7">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[.16em] text-muted-foreground"><ScanLine className="size-4 text-orange-500" /> Moment finder <span className="hidden truncate font-normal normal-case tracking-normal sm:inline">/ {sourceName}</span></div>
        <h2 className="mt-2 line-clamp-2 text-lg font-semibold tracking-tight sm:text-xl">{loading ? "Finding the moment" : analysis ? analysis.title : "Your video, ready to explore"}</h2>
        {question && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground" title={question}>{question}</p>}
      </div>
      {loading ? <button type="button" onClick={onCancel} className="flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"><Square className="size-3" /> Stop scan</button> : <span className="flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-xs font-medium">{analysis ? <Check className="size-3 text-primary" /> : <Play className="size-3" />}{analysis ? "Scan complete" : "Preview"}</span>}
    </header>

    <div className="moment-stage relative overflow-hidden px-4 py-7 sm:px-10 sm:py-10">
      <div aria-hidden="true" className={`moment-film absolute inset-x-0 top-1/2 h-28 -translate-y-1/2 ${loading ? "moment-film-active" : ""}`} />
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-lg border-[5px] border-[#202320] bg-black shadow-2xl shadow-black/25">
        {youtubeId ? <iframe key={`${youtubeId}-${seekVersion}`} title="Video preview" className="aspect-video w-full" src={`https://www.youtube.com/embed/${youtubeId}?rel=0&playsinline=1${selected !== null ? `&start=${active?.seconds ?? 0}&autoplay=1` : ""}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> :
          <video ref={videoRef} src={localUrl} controls playsInline preload="metadata" className="aspect-video w-full" onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onError={() => setPlayerError("This browser cannot play this file. Try an MP4 video.")} />}
      </div>
      {youtubeId && <p className="relative mx-auto mt-3 max-w-3xl text-right text-xs text-muted-foreground">If embedding is unavailable, <a className="underline underline-offset-2" href={`https://www.youtube.com/watch?v=${youtubeId}${active ? `&t=${active.seconds}s` : ""}`} target="_blank" rel="noopener noreferrer">watch on YouTube</a>.</p>}
      {playerError && <p role="alert" className="relative mt-3 text-center text-sm text-destructive">{playerError}</p>}
    </div>

    <div className="border-t border-border px-5 py-6 text-center sm:px-7">
      <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-orange-500">{loading ? <><LoaderCircle className="size-3 animate-spin" /> Analyzing video</> : active ? "Selected moment" : analysis ? `${moments.length} ${analysis.searchResult ? "matching" : "key"} moments` : youtubeId ? "Preview starts at" : "Video position"}</p>
      <div className="mt-2 font-mono text-[clamp(2.5rem,9vw,5.5rem)] font-bold leading-none tracking-[-.08em] tabular-nums">{loading ? formatVideoTime(elapsed) : formatVideoTime(selectedTime)}</div>
      <p role="status" className="mx-auto mt-3 max-w-xl text-xs leading-5 text-muted-foreground">{loading ? "Elapsed scan time · video timestamps appear when the analysis finishes." : active ? active.description : analysis ? moments.length ? "Choose a moment below to play it inside this video." : "No matching moments were identified. Open the report for details." : "Preview the footage, then describe the moment you want to find."}</p>
      {loading && <div role="progressbar" aria-label="Video analysis in progress" className="moment-progress mx-auto mt-5 h-1.5 max-w-xl overflow-hidden rounded-full bg-orange-500/15"><span className="block h-full w-1/3 rounded-full bg-orange-500" /></div>}
    </div>

    {analysis && <div className="border-t border-border px-5 py-5 sm:px-7">
      <div className="mb-5 flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-2"><Target className="size-4 text-orange-500" />{duration ? "Video timeline" : "Matched moment range"}</span><span>{moments.length} markers</span></div>
      <div className="relative mx-3 h-3 rounded-sm bg-orange-500/20">
        {moments.map((moment, index) => <button key={index} type="button" onClick={() => seek(index)} aria-label={`Jump to ${moment.timestamp}`} title={moment.description} className={`absolute -top-2 h-7 w-2 -translate-x-1/2 rounded-sm transition hover:scale-y-125 ${selected === index ? "bg-orange-500 ring-4 ring-orange-500/15" : "bg-orange-500/60"}`} style={{left: `${moment.seconds / rangeEnd * 100}%`}} />)}
      </div>
      <div className="mt-3 flex justify-between font-mono text-[10px] text-muted-foreground"><span>00:00:00</span><span>{formatVideoTime(rangeEnd)}</span></div>
      <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
        {moments.map((moment, index) => <button type="button" key={index} onClick={() => seek(index)} aria-pressed={selected === index} aria-label={`Play moment at ${moment.timestamp}`} className={`w-48 shrink-0 rounded-xl border p-3 text-left transition hover:border-orange-500 ${selected === index ? "border-orange-500 bg-orange-500/10" : "border-border bg-background"}`}>
          <div className="flex items-center justify-between"><span className="font-mono text-sm font-semibold text-orange-500">{moment.timestamp}</span><Play className="size-4 text-orange-500" /></div>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{moment.description}</p>
        </button>)}
        {!moments.length && <div className="flex items-center gap-3 py-3 text-sm text-muted-foreground"><Film className="size-5" />No matching moment found in the visible footage.</div>}
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{analysis.summary}</p>
      <details className="mt-4 rounded-xl border border-border bg-background p-4">
        <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">View full {analysis.searchResult ? "incident report" : "analysis"}<ChevronDown className="size-4" /></summary>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{analysis.searchResult?.answer ?? analysis.summary}</p>
        {analysis.insights.length > 0 && <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">{analysis.insights.map((insight, index) => <li key={index}>{insight}</li>)}</ul>}
      </details>
    </div>}
  </section>;
}

