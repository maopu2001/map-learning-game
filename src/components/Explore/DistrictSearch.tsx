"use client";

import React, { useState, useMemo } from "react";
import { DistrictData, BANGLADESH_DISTRICTS } from "@/data/bangladesh";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import { Globe, ArrowRight, CornerDownLeft } from "lucide-react";
import { useCommandK } from "@/hooks/useCommandK";

interface DistrictSearchProps {
  onSelectDistrict: (district: DistrictData) => void;
  divisionFilter?: string;
}

export function DistrictSearch({
  onSelectDistrict,
  divisionFilter = "All",
}: DistrictSearchProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const inputRef = useCommandK(() => setSearchOpen(true));

  const submitQuery = (rawQuery: string) => {
    const q = rawQuery.trim().toLowerCase();
    if (!q) return;

    const exact = filteredDistricts.find((d) => d.name.toLowerCase() === q);
    const first =
      exact ||
      filteredDistricts.find((d) => d.name.toLowerCase().startsWith(q)) ||
      filteredDistricts[0];
    if (first) {
      onSelectDistrict(first);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const filteredDistricts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = BANGLADESH_DISTRICTS.filter((d) => {
      const matchesDivision =
        divisionFilter === "All" || d.division === divisionFilter;
      if (!matchesDivision) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.division.toLowerCase().includes(q) ||
        d.aliases?.some((a) => a.toLowerCase().includes(q))
      );
    });

    if (!q) return list;

    return list.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q);
      const bStarts = b.name.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });
  }, [searchQuery, divisionFilter]);

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
            placeholder="Type district name (Dhaka, Sylhet)..."
            className="text-base sm:text-sm font-medium"
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
              className="absolute right-2.5 top-2 flex items-center gap-1 text-xs font-mono text-bd-primary bg-bd-subtle hover:bg-bd-primary/20 border border-bd-subtle-border px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
            >
              <span>Go</span>
              <CornerDownLeft className="size-3 text-bd-primary" />
            </button>
          )}
        </div>

        {searchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <CommandList className="max-h-56 sm:max-h-64 rounded-xl border border-border bg-card/98 backdrop-blur-2xl shadow-2xl p-1.5 overflow-y-auto">
              {filteredDistricts.slice(0, 8).map((d) => (
                <CommandItem
                  key={d.id}
                  value={d.name}
                  onSelect={() => {
                    onSelectDistrict(d);
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2.5 sm:py-2 min-h-[42px] rounded-lg text-foreground hover:bg-muted data-[selected=true]:bg-muted data-[selected=true]:text-foreground cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-foreground">
                      {d.name}
                    </span>
                    {d.aliases && d.aliases.length > 0 && (
                      <span className="text-2xs text-muted-foreground font-mono">
                        (aka {d.aliases.join(", ")})
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground font-mono">
                      ({d.division} Div)
                    </span>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground opacity-60" />
                </CommandItem>
              ))}
              {filteredDistricts.length === 0 && (
                <CommandEmpty className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 font-mono">
                  <Globe className="size-4 text-muted-foreground" />
                  <span>No districts found</span>
                </CommandEmpty>
              )}
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}
