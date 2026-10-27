"use client";

import React, { useState, useMemo } from "react";
import { CountryData, COUNTRIES } from "@/data/world";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import { Globe, ArrowRight, CornerDownLeft } from "lucide-react";
import { useCommandK } from "@/hooks/useCommandK";
import { getContinentForCountry } from "@/components/Explore/RegionFilterBar";

interface CountrySearchProps {
  onSelectCountry: (country: CountryData) => void;
  continentFilter?: string;
  subregionFilter?: string;
}

export function CountrySearch({
  onSelectCountry,
  continentFilter = "All",
  subregionFilter = "All",
}: CountrySearchProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const inputRef = useCommandK(() => setSearchOpen(true));

  const submitQuery = (rawQuery: string) => {
    const q = rawQuery.trim().toLowerCase();
    if (!q) return;

    const exact = filteredCountries.find(
      (c) =>
        c.name.toLowerCase() === q ||
        c.id.toLowerCase() === q ||
        (c.nameBn && c.nameBn.toLowerCase() === q) ||
        c.capital.toLowerCase() === q ||
        (c.capitalBn && c.capitalBn.toLowerCase() === q),
    );
    const first =
      exact ||
      filteredCountries.find(
        (c) =>
          c.name.toLowerCase().startsWith(q) ||
          c.id.toLowerCase().startsWith(q) ||
          (c.nameBn && c.nameBn.toLowerCase().startsWith(q)) ||
          c.capital.toLowerCase().startsWith(q) ||
          (c.capitalBn && c.capitalBn.toLowerCase().startsWith(q)),
      ) ||
      filteredCountries[0];
    if (first) {
      onSelectCountry(first);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = COUNTRIES.filter((c) => {
      const matchesContinent =
        continentFilter === "All" ||
        getContinentForCountry(c) === continentFilter;
      if (!matchesContinent) return false;

      const matchesSubregion =
        subregionFilter === "All" || c.subregion === subregionFilter;
      if (!matchesSubregion) return false;

      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.nameBn && c.nameBn.toLowerCase().includes(q)) ||
        c.id.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        (c.capitalBn && c.capitalBn.toLowerCase().includes(q)) ||
        c.continent.toLowerCase().includes(q) ||
        (c.continentBn && c.continentBn.toLowerCase().includes(q)) ||
        (c.subregion && c.subregion.toLowerCase().includes(q)) ||
        (c.subregionBn && c.subregionBn.toLowerCase().includes(q)) ||
        (c.officialName && c.officialName.toLowerCase().includes(q)) ||
        c.aliases.some((a) => a.toLowerCase().includes(q))
      );
    });

    if (!q) return list;

    return list.sort((a, b) => {
      const aExact =
        a.name.toLowerCase() === q ||
        a.id.toLowerCase() === q ||
        (a.nameBn && a.nameBn.toLowerCase() === q) ||
        a.capital.toLowerCase() === q ||
        (a.capitalBn && a.capitalBn.toLowerCase() === q);
      const bExact =
        b.name.toLowerCase() === q ||
        b.id.toLowerCase() === q ||
        (b.nameBn && b.nameBn.toLowerCase() === q) ||
        b.capital.toLowerCase() === q ||
        (b.capitalBn && b.capitalBn.toLowerCase() === q);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts =
        a.name.toLowerCase().startsWith(q) ||
        a.id.toLowerCase().startsWith(q) ||
        (a.nameBn && a.nameBn.toLowerCase().startsWith(q)) ||
        a.capital.toLowerCase().startsWith(q) ||
        (a.capitalBn && a.capitalBn.toLowerCase().startsWith(q));
      const bStarts =
        b.name.toLowerCase().startsWith(q) ||
        b.id.toLowerCase().startsWith(q) ||
        (b.nameBn && b.nameBn.toLowerCase().startsWith(q)) ||
        b.capital.toLowerCase().startsWith(q) ||
        (b.capitalBn && b.capitalBn.toLowerCase().startsWith(q));
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      const aNameInc =
        a.name.toLowerCase().includes(q) ||
        (a.nameBn && a.nameBn.toLowerCase().includes(q)) ||
        a.capital.toLowerCase().includes(q) ||
        (a.capitalBn && a.capitalBn.toLowerCase().includes(q));
      const bNameInc =
        b.name.toLowerCase().includes(q) ||
        (b.nameBn && b.nameBn.toLowerCase().includes(q)) ||
        b.capital.toLowerCase().includes(q) ||
        (b.capitalBn && b.capitalBn.toLowerCase().includes(q));
      if (aNameInc && !bNameInc) return -1;
      if (!aNameInc && bNameInc) return 1;

      return 0;
    });
  }, [searchQuery]);

  return (
    <div className="relative w-full z-20">
      <Command
        className="rounded-2xl border border-border bg-card shadow-2xl backdrop-blur-xl overflow-visible"
        shouldFilter={false}
      >
        <div className="relative">
          <CommandInput
            ref={inputRef}
            value={searchQuery}
            onValueChange={(val) => {
              setSearchQuery(val);
              if (!searchOpen && val.length > 0) setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const activeItem = document.querySelector(
                  '[cmdk-item][aria-selected="true"]',
                );
                if (!activeItem && searchQuery.trim().length > 0) {
                  e.preventDefault();
                  submitQuery(searchQuery);
                }
              }
            }}
            placeholder="Search by name, capital, ISO code, or alias..."
            className="text-sm font-medium"
          />
          {!searchQuery && (
            <div className="absolute right-3 top-2.5 hidden sm:flex items-center gap-0.5 text-3xs font-mono text-muted-foreground bg-muted/50 border border-border px-1.5 py-0.5 rounded pointer-events-none select-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          )}
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => submitQuery(searchQuery)}
              className="absolute right-2.5 top-2 flex items-center gap-1 text-xs font-mono text-foreground bg-primary/20 hover:bg-primary/30 border border-primary/40 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
            >
              <span>Go</span>
              <CornerDownLeft className="size-3 text-primary" />
            </button>
          )}
        </div>

        {searchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <CommandList className="max-h-56 sm:max-h-64 rounded-xl border border-border bg-card/98 backdrop-blur-2xl shadow-2xl p-1.5 overflow-y-auto">
              {filteredCountries.slice(0, 8).map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.name}
                  onSelect={() => {
                    onSelectCountry(c);
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2.5 sm:py-2 min-h-[42px] rounded-lg text-foreground hover:bg-muted data-[selected=true]:bg-muted data-[selected=true]:text-foreground cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{c.flagEmoji}</span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm text-foreground">
                          {c.name}
                        </span>
                        {c.nameBn && (
                          <span className="text-xs text-accent font-medium">
                            ({c.nameBn})
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground font-mono">
                          ({c.id})
                        </span>
                      </div>
                      <span className="text-2xs text-muted-foreground font-mono">
                        {c.capital}
                        {c.capitalBn ? ` (${c.capitalBn})` : ""} • {c.continent}
                        {c.subregion ? ` • ${c.subregion}` : ""}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground opacity-60" />
                </CommandItem>
              ))}
              {filteredCountries.length === 0 && (
                <CommandEmpty className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 font-mono">
                  <Globe className="size-4 text-muted-foreground" />
                  <span>No countries found</span>
                </CommandEmpty>
              )}
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}
