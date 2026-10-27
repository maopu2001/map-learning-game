import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shimana (সীমানা) — Map & Geography Game",
    short_name: "Shimana",
    description:
      "Guess the secret country or Bangladesh district in 6 tries with distance and compass direction clues.",
    start_url: "/",
    id: "/",
    display: "standalone",
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
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
