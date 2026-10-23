"use client";

import React, { useState } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import { COUNTRIES, CountryData } from "@/data/world";
import { BANGLADESH_DISTRICTS, DistrictData } from "@/data/bangladesh";
import { useGameStore } from "@/lib/store";
import { Globe, ArrowRight, CornerDownLeft, Trophy, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommandK } from "@/hooks/useCommandK";

export function GuessInput() {
  const scope = useGameStore((s) => s.scope);
  const mode = useGameStore((s) => s.mode);
  const makeGuess = useGameStore((s) => s.makeGuess);
  const guesses = useGameStore((s) => s.guesses);
  const gameStatus = useGameStore((s) => s.gameStatus);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const inputRef = useCommandK(() => setOpen(true));

  const guessedIds = React.useMemo(
    () => new Set(guesses.map((g) => g.country.id)),
    [guesses],
  );

  const isBD = scope === "bangladesh";
  const allowCountryAliases = mode !== "detective";

  // Filter items excluding already guessed
  const availableCountries = React.useMemo(
    () => COUNTRIES.filter((c) => !guessedIds.has(c.id)),
    [guessedIds],
  );
  const availableDistricts = React.useMemo(
    () => BANGLADESH_DISTRICTS.filter((d) => !guessedIds.has(d.id)),
    [guessedIds],
  );

  const matchesDistrict = (d: DistrictData, q: string) => {
    const lower = q.toLowerCase();
    return (
      d.name.toLowerCase().includes(lower) ||
      Boolean(d.aliases?.some((a) => a.toLowerCase().includes(lower)))
    );
  };

  const matchesCountry = (c: CountryData, q: string) => {
    const lower = q.toLowerCase();
    return (
      c.name.toLowerCase().includes(lower) ||
      c.id.toLowerCase().includes(lower) ||
      (allowCountryAliases &&
        c.aliases.some((a) => a.toLowerCase().includes(lower)))
    );
  };

  const handleSelectCountry = (country: CountryData) => {
    makeGuess(country);
    setQuery("");
    setOpen(false);
  };

  const handleSelectDistrict = (district: DistrictData) => {
    makeGuess(district);
    setQuery("");
    setOpen(false);
  };

  const filteredDistricts = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableDistricts;
    const list = availableDistricts.filter((d) => matchesDistrict(d, q));
    return list.sort((a, b) => {
      const aExact = a.name.toLowerCase() === q;
      const bExact = b.name.toLowerCase() === q;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts = a.name.toLowerCase().startsWith(q);
      const bStarts = b.name.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return 0;
    });
  }, [availableDistricts, query]);

  const filteredCountries = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableCountries;
    const list = availableCountries.filter((c) => matchesCountry(c, q));
    return list.sort((a, b) => {
      const aExact = a.name.toLowerCase() === q || a.id.toLowerCase() === q;
      const bExact = b.name.toLowerCase() === q || b.id.toLowerCase() === q;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts =
        a.name.toLowerCase().startsWith(q) || a.id.toLowerCase().startsWith(q);
      const bStarts =
        b.name.toLowerCase().startsWith(q) || b.id.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      const aNameInc = a.name.toLowerCase().includes(q);
      const bNameInc = b.name.toLowerCase().includes(q);
      if (aNameInc && !bNameInc) return -1;
      if (!aNameInc && bNameInc) return 1;

      return 0;
    });
  }, [availableCountries, query, allowCountryAliases]);

  const submitQuery = (rawQuery: string) => {
    const q = rawQuery.trim().toLowerCase();
    if (!q) return;

    if (isBD) {
      const exact = filteredDistricts.find(
        (d) =>
          d.name.toLowerCase() === q ||
          d.aliases?.some((a) => a.toLowerCase() === q),
      );
      const first =
        exact ||
        filteredDistricts.find((d) => d.name.toLowerCase().startsWith(q)) ||
        filteredDistricts[0];
      if (first) handleSelectDistrict(first);
    } else {
      const exact = filteredCountries.find(
        (c) =>
          c.name.toLowerCase() === q ||
          c.id.toLowerCase() === q ||
          (allowCountryAliases &&
            c.aliases.some((a) => a.toLowerCase() === q)),
      );
      const first =
        exact ||
        filteredCountries.find(
          (c) =>
            c.name.toLowerCase().startsWith(q) ||
            c.id.toLowerCase().startsWith(q),
        ) ||
        filteredCountries[0];
      if (first) handleSelectCountry(first);
    }
  };

  const setGameOverOpen = useGameStore((s) => s.setGameOverOpen);

  if (gameStatus !== "playing") {
    if (mode === "daily") {
      const isWon = gameStatus === "won";
      return (
        <div className="w-full p-2.5 sm:p-3 rounded-2xl bg-surface-card border border-white/10 flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2 min-w-0">
            {isWon ? (
              <Trophy className="size-4 sm:size-5 text-amber-400 shrink-0" />
            ) : (
              <XCircle className="size-4 sm:size-5 text-rose-500 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {isWon ? "Daily Puzzle Solved!" : "Daily Puzzle Completed"}
              </p>
              <p className="text-2xs text-slate-400 font-mono">
                1 play per day • {guesses.length} guesses
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setGameOverOpen(true)}
            className="h-7 text-xs px-2.5 border-white/10 bg-white/5 hover:bg-white/10 text-sky-400 hover:text-sky-300 rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Eye className="size-3" />
            <span>Result</span>
          </Button>
        </div>
      );
    }
    return null;
  }

  const placeholder = isBD
    ? "Type district name (Dhaka, Sylhet)..."
    : "Type country name (Japan, France)...";

  return (
    <div className="relative w-full z-20">
      <Command
        className="rounded-2xl border border-white/10 bg-surface-card shadow-2xl backdrop-blur-xl overflow-visible"
        shouldFilter={false}
      >
        <div className="relative">
          <CommandInput
            ref={inputRef}
            value={query}
            onValueChange={(val) => {
              setQuery(val);
              if (!open && val.length > 0) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const activeItem = document.querySelector(
                  '[cmdk-item][aria-selected="true"]',
                );
                if (!activeItem && query.trim().length > 0) {
                  e.preventDefault();
                  submitQuery(query);
                }
              }
            }}
            placeholder={placeholder}
            className="text-base sm:text-sm font-medium"
          />
          {!query && (
            <div className="absolute right-3 top-2.5 hidden sm:flex items-center gap-0.5 text-3xs font-mono text-slate-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded pointer-events-none select-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          )}
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => submitQuery(query)}
              className="absolute right-2.5 top-2 flex items-center gap-1 text-xs font-mono text-slate-200 bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
            >
              <span>Submit</span>
              <CornerDownLeft className="size-3 text-sky-400" />
            </button>
          )}
        </div>

        {open && query.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <CommandList className="max-h-56 sm:max-h-64 rounded-xl border border-white/10 bg-surface-card/98 backdrop-blur-2xl shadow-2xl p-1.5 overflow-y-auto">
              {isBD ? (
                <>
                  {filteredDistricts.slice(0, 8).map((d) => (
                    <CommandItem
                      key={d.id}
                      value={d.name}
                      onSelect={() => handleSelectDistrict(d)}
                      className="flex items-center justify-between px-3 py-2.5 sm:py-2 min-h-10.5 rounded-lg text-slate-200 hover:bg-white/5 hover:text-white data-[selected=true]:bg-white/10 data-[selected=true]:text-white cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-xs sm:text-sm text-white">
                          {d.name}
                        </span>
                        {d.aliases && d.aliases.length > 0 && (
                          <span className="text-2xs text-slate-400 font-mono">
                            (aka {d.aliases.join(", ")})
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">
                          ({d.division} Div)
                        </span>
                      </div>
                      <ArrowRight className="size-3.5 text-slate-500 opacity-60" />
                    </CommandItem>
                  ))}
                  {filteredDistricts.length === 0 && (
                    <CommandEmpty className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
                      <Globe className="size-4 text-slate-500" />
                      <span>No districts found</span>
                    </CommandEmpty>
                  )}
                </>
              ) : (
                <>
                  {filteredCountries.slice(0, 8).map((c) => (
                    <CommandItem
                      key={c.id}
                      value={c.name}
                      onSelect={() => handleSelectCountry(c)}
                      className="flex items-center justify-between px-3 py-2.5 sm:py-2 min-h-10.5 rounded-lg text-slate-200 hover:bg-white/5 hover:text-white data-[selected=true]:bg-white/10 data-[selected=true]:text-white cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{c.flagEmoji}</span>
                        <span className="font-semibold text-xs sm:text-sm text-white">
                          {c.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ({c.id})
                        </span>
                        <span className="text-xs text-slate-500 hidden sm:inline font-mono">
                          {c.continent}
                        </span>
                      </div>
                      <ArrowRight className="size-3.5 text-slate-500 opacity-60" />
                    </CommandItem>
                  ))}
                  {filteredCountries.length === 0 && (
                    <CommandEmpty className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
                      <Globe className="size-4 text-slate-500" />
                      <span>No countries found</span>
                    </CommandEmpty>
                  )}
                </>
              )}
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}
