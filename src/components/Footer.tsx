import React from "react";
import { Globe, CodeXml } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/10 py-6 text-xs text-slate-400 bg-surface-base/80 mt-16 sm:mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 text-center sm:text-left">
          <p className="font-normal text-slate-300">
            Shimana (সীমানা) © {year} · Interactive map guessing game for Bangladesh & the world
          </p>
          <p className="text-[11px] text-slate-500">
            Built for geography enthusiasts, learners & educators.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-2 text-xs">
          <a
            href="https://maopu.com.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-slate-200 hover:text-sky-400 transition-colors cursor-pointer group"
          >
            <Globe className="size-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
            <span>M. Aktaruzzaman Opu</span>
          </a>

          <span className="text-white/15 select-none">|</span>

          <a
            href="https://github.com/maopu2001"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg
              className="size-3.5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>GitHub</span>
          </a>

          <span className="text-white/15 select-none">|</span>

          <a
            href="https://github.com/maopu2001/map-learning-game"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <CodeXml className="size-3.5 text-sky-400" />
            <span>Source</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
