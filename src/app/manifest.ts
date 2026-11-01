import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shimana (সীমানা) - Map & Geography Game",
    short_name: "Shimana",
    description:
      "Guess the secret country or Bangladesh district in 6 tries with distance and compass direction clues.",
    start_url: "/",
    scope: "/",
    id: "/",
    display: "standalone",
    display_override: ["standalone", "window-controls-overlay"],
    launch_handler: {
      client_mode: ["focus-existing", "auto"],
    },
    protocol_handlers: [
      {
        protocol: "web+shimana",
        url: "/?open=%s",
      },
    ],
    orientation: "any",
    background_color: "#03160b",
    theme_color: "#072014",
    categories: ["games", "education", "puzzle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "World Map",
        short_name: "World",
        description: "Play World Country Guessing Game",
        url: "/world",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Bangladesh Map",
        short_name: "Bangladesh",
        description: "Play Bangladesh District Guessing Game",
        url: "/bangladesh",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}

