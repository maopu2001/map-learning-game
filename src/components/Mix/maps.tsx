import React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function getDistrictMapsUrl(name: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}+District,+Bangladesh`;
}

export function getCountryMapsUrl(name: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
}

interface MapsLinkButtonProps {
  name: string;
  isDistrict?: boolean;
  className?: string;
}

export function MapsLinkButton({
  name,
  isDistrict = false,
  className,
}: MapsLinkButtonProps) {
  const url = isDistrict ? getDistrictMapsUrl(name) : getCountryMapsUrl(name);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Open in Google Maps"
      aria-label={`Open ${name}${isDistrict ? " District" : ""} in Google Maps`}
      className={cn(
        "inline-flex items-center justify-center p-0.5 rounded hover:bg-accent/15 text-muted-foreground hover:text-accent transition-colors cursor-pointer",
        className,
      )}
    >
      <ExternalLink className="size-3" />
    </a>
  );
}
