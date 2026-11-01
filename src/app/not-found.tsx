import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Compass, Home } from "lucide-react";

export const metadata = {
  title: "404 — Lost in Uncharted Territory | Shimana",
  description:
    "The requested coordinate or map route does not exist. Navigate back to charted territory.",
};

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Compass Graphic with Radar Rings */}
          <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-primary/30 animate-[spin_24s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border border-border/80" />
            <div className="absolute inset-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-[pulse_3s_ease-in-out_infinite]" />
            </div>
            <span className="absolute -top-1 px-1.5 py-0.5 text-3xs font-mono font-bold tracking-widest uppercase bg-card border border-border rounded text-muted-foreground">
              N 00°00&apos;
            </span>
          </div>

          {/* Heading & Context */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-xs font-semibold tracking-wide">
              <span>Error 404</span>
              <span className="inline-block w-1 h-1 rounded-full bg-destructive/60" />
              <span>Uncharted Territory</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Off the Edge of the Map
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              The coordinate or page you navigated to doesn&apos;t exist in
              Shimana&apos;s records. Let&apos;s get you back on charted
              terrain.
            </p>
          </div>

          {/* Return Home Link */}
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm shadow-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
