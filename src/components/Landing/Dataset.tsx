import { Compass } from "lucide-react";

export default function Dataset() {
  return (
    <section className="space-y-4" id="dataset">
      <div className="text-center space-y-1">
        <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
          Data Unlocked
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground">
          Sources, Sorted & Ready
        </h2>
      </div>

      <div className="p-4 rounded-2xl border border-primary/30 bg-card">
        {/* Two-Column Bento Layout */}
        <div className="relative grid grid-cols-1 gap-3 sm:gap-4 text-left">
          {/* Bangladesh Dataset */}
          <div className="group rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 p-3 sm:p-3.5 transition-all flex flex-col justify-between gap-2.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-bd-primary/15 text-bd-primary border border-bd-primary/25">
                    <div className="flex items-center justify-center size-3.5 text-sm">
                      🇧🇩
                    </div>
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
                    Bangladesh Dataset
                  </h3>
                </div>
                <span className="text-2xs font-mono px-2 py-0.5 rounded-md bg-bd-primary/10 text-bd-primary font-semibold border border-bd-primary/20">
                  64 Districts
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mapped all 64 districts using official Bangladesh Bureau of
                Statistics and GeoNames records for boundaries and coordinates,
                layered with cultural tidbits covering local history, landmarks,
                and famous regional sweets and foods.
              </p>
            </div>

            {/* Tag Pill Strip */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-2xs font-mono text-muted-foreground">
              <span className="px-2 py-0.5 rounded-md bg-card border border-border/70">
                BBS Official
              </span>
              <span className="px-2 py-0.5 rounded-md bg-card border border-border/70">
                GeoNames
              </span>
              <span className="px-2 py-0.5 rounded-md bg-card border border-border/70">
                GI Heritage
              </span>
            </div>
          </div>

          {/* World Dataset */}
          <div className="group rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 p-3 sm:p-3.5 transition-all flex flex-col justify-between gap-2.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-accent/15 text-accent border border-accent/25">
                    <Compass className="size-3.5" />
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
                    World Dataset
                  </h3>
                </div>
                <span className="text-2xs font-mono px-2 py-0.5 rounded-md bg-accent/10 text-accent font-semibold border border-accent/20">
                  195 Nations
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pulled core stats like capitals, borders, coordinates, and
                populations from open sources like REST Countries, the UN, and
                the World Bank—then added sea neighbors for island nations and
                handpicked fun trivia for clues.
              </p>
            </div>

            {/* Tag Pill Strip */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-2xs font-mono text-muted-foreground">
              <span className="px-2 py-0.5 rounded-md bg-card border border-border/70">
                REST Countries
              </span>
              <span className="px-2 py-0.5 rounded-md bg-card border border-border/70">
                UN Data
              </span>
              <span className="px-2 py-0.5 rounded-md bg-card border border-border/70">
                World Bank
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
