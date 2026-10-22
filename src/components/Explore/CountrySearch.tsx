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

interface CountrySearchProps {
  onSelectCountry: (country: CountryData) => void;
}

export function CountrySearch({ onSelectCountry }: CountrySearchProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const inputRef = useCommandK(() => setSearchOpen(true));

  const submitQuery = (rawQuery: string) => {
    const q = rawQuery.trim().toLowerCase();
    if (!q) return;

    const exact = COUNTRIES.find((c) => c.name.toLowerCase() === q);
    const first =
      exact ||
      COUNTRIES.find(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase() === q ||
          c.capital.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          (c.subregion && c.subregion.toLowerCase().includes(q)) ||
          (c.officialName && c.officialName.toLowerCase().includes(q)) ||
          c.aliases.some((a) => a.toLowerCase().includes(q)),
      );
    if (first) {
      onSelectCountry(first);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        (c.subregion && c.subregion.toLowerCase().includes(q)) ||
        (c.officialName && c.officialName.toLowerCase().includes(q)) ||
        c.aliases.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  return (
    <div className="relative w-full z-20">
      <Command
        className="rounded-2xl border border-white/10 bg-[#0c101c] shadow-2xl backdrop-blur-xl overflow-visible"
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
              if (e.key === "Enter" && searchQuery.trim().length > 0) {
                e.preventDefault();
                submitQuery(searchQuery);
              }
            }}
            placeholder="Search by name, capital, ISO code, or alias..."
            className="text-base sm:text-sm font-medium"
          />
          {!searchQuery && (
            <div className="absolute right-3 top-2.5 hidden sm:flex items-center gap-0.5 text-3xs font-mono text-slate-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded pointer-events-none select-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          )}
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => submitQuery(searchQuery)}
              className="absolute right-2.5 top-2 flex items-center gap-1 text-xs font-mono text-slate-200 bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
            >
              <span>Go</span>
              <CornerDownLeft className="size-3 text-sky-400" />
            </button>
          )}
        </div>

        {searchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <CommandList className="max-h-56 sm:max-h-64 rounded-xl border border-white/10 bg-[#0c101c]/98 backdrop-blur-2xl shadow-2xl p-1.5 overflow-y-auto">
              {filteredCountries.slice(0, 8).map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.name} ${c.id} ${c.capital} ${c.region} ${c.subregion || ""} ${c.aliases.join(" ")}`}
                  onSelect={() => {
                    onSelectCountry(c);
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2.5 sm:py-2 min-h-[42px] rounded-lg text-slate-200 hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{c.flagEmoji}</span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs sm:text-sm text-white">
                          {c.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ({c.id})
                        </span>
                      </div>
                      <span className="text-2xs text-slate-400 font-mono">
                        {c.capital} • {c.subregion || c.region}
                      </span>
                    </div>
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
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}
