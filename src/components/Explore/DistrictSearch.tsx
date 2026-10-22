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

  const submitQuery = (rawQuery: string) => {
    const q = rawQuery.trim().toLowerCase();
    if (!q) return;

    const exact = BANGLADESH_DISTRICTS.find((d) => d.name.toLowerCase() === q);
    const first =
      exact ||
      BANGLADESH_DISTRICTS.find(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.division.toLowerCase().includes(q) ||
          d.aliases?.some((a) => a.toLowerCase().includes(q)),
      );
    if (first) {
      onSelectDistrict(first);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const filteredDistricts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return BANGLADESH_DISTRICTS.filter((d) => {
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
  }, [searchQuery, divisionFilter]);

  return (
    <div className="relative w-full z-20">
      <Command
        className="rounded-2xl border border-white/10 bg-[#0c101c] shadow-2xl backdrop-blur-xl overflow-visible"
        shouldFilter={false}
      >
        <div className="relative">
          <CommandInput
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
            placeholder="Type district name (Dhaka, Sylhet)..."
            className="text-base sm:text-sm font-medium"
          />
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
              {filteredDistricts.slice(0, 8).map((d) => (
                <CommandItem
                  key={d.id}
                  value={`${d.name} ${d.aliases?.join(" ") || ""}`}
                  onSelect={() => {
                    onSelectDistrict(d);
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2.5 sm:py-2 min-h-[42px] rounded-lg text-slate-200 hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
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
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}
