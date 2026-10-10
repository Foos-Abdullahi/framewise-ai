import { ThemeToggle } from "@/components/theme-toggle";
import { ScanLine } from "lucide-react";
import { VideoAnalyzer } from "@/components/video-analyzer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3 font-semibold tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><ScanLine className="size-5" /></span><span>Framewise <span className="font-normal text-muted-foreground">/ Moment Finder</span></span></div>
        <ThemeToggle />
      </nav>
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-5 sm:px-8">
        <div className="mb-7">
          <p className="mb-2 text-xs font-medium uppercase tracking-[.2em] text-orange-500">Less watching. More finding.</p>
          <h1 className="text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Go straight to the moment.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Add a video. Describe what happens. Find where it happens.</p>
        </div>
        <VideoAnalyzer />
      </section>
    </main>
  );
}
