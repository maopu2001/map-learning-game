"use client";

import React from "react";
import { TerritoryReconBody, TerritoryReconProps } from "./TerritoryReconWindow";

export type TerritoryReconSheetProps = TerritoryReconProps & {
  onClose: () => void;
};

export function TerritoryReconSheet(props: TerritoryReconSheetProps) {
  if (!props.inspectedTerritory) return null;

  return (
    <div className="md:hidden absolute bottom-2 left-2 right-2 z-30 rounded-2xl border border-border bg-card/98 p-3 shadow-2xl backdrop-blur-xl text-xs text-foreground space-y-2 animate-in fade-in zoom-in-95">
      <TerritoryReconBody {...props} />
    </div>
  );
}
