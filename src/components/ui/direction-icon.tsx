import React from "react";
import {
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  Target,
} from "lucide-react";
import { Direction } from "@/lib/engine";

interface DirectionIconProps {
  direction?: Direction | string;
  isCorrect?: boolean;
  className?: string;
}

export function DirectionIcon({
  direction,
  isCorrect,
  className = "size-4",
}: DirectionIconProps) {
  if (isCorrect) {
    return <Target className={`${className} text-emerald-400`} />;
  }

  switch (direction) {
    case "N":
      return <ArrowUp className={className} />;
    case "NE":
      return <ArrowUpRight className={className} />;
    case "E":
      return <ArrowRight className={className} />;
    case "SE":
      return <ArrowDownRight className={className} />;
    case "S":
      return <ArrowDown className={className} />;
    case "SW":
      return <ArrowDownLeft className={className} />;
    case "W":
      return <ArrowLeft className={className} />;
    case "NW":
      return <ArrowUpLeft className={className} />;
    default:
      return <ArrowUp className={className} />;
  }
}
