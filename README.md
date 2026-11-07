# Shimana (সীমানা) — Map Guessing Game & Geographic Atlas

Shimana (সীমানা) is an interactive geographic map-guessing game and atlas, built for enthusiasts, students, and educators to master local and global geography. Inspired by popular daily guessing games, Shimana features a bilingual interface (English & Bengali) and provides dynamic proximity feedback to help you zero in on mystery locations.

## 🚀 Key Features

*   **Two Game Arenas**:
    *   🇧🇩 **Bangladesh Districts**: Guess all 64 districts across 8 administrative divisions. Includes detailed trivia, local history, and regional cultural facts.
    *   🌍 **World Countries**: Guess 195 nations across all continents. Features precise distance calculations, bearing indicators, and land/maritime border clues.
*   **Game Modes & Difficulties**:
    *   **Daily Mystery**: A synchronized daily challenge for everyone.
    *   **Detective Mode**: Unlimited practice for sharpening skills.
    *   **Difficulty Scaling**: Choose **Easy** (8 guesses, clues), **Normal** (6 guesses), or **Hard** (5 guesses, high stakes).
*   **Interactive Map Explorer**:
    *   Browse any district or country, filter by division/continent, and view detailed dossiers. Includes click-to-pan functionality to explore neighboring regions.
*   **PWA & Offline Capability**:
    *   Installable on mobile and desktop, featuring offline fallback support (`/offline`) for seamless learning anywhere.
*   **Bilingual**: Full support for English and Bengali (বাংলা).

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 16 (App Router), React 19
*   **Language**: TypeScript 5.8
*   **Styling**: Tailwind CSS v4, PostCSS
*   **Maps & Spatial Math**: `react-simple-maps`, `d3-geo`, `d3-zoom`, `topojson-client`, custom haversine/bearing engine
*   **State & Persistence**: Zustand
*   **UI Components**: Radix UI, Lucide Icons, Canvas Confetti

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 20+
*   pnpm (recommended)

### Installation
```bash
git clone https://github.com/maopu2001/map-learning-game.git
cd world-map
pnpm install
```

### Running the App
*   **Development**: `pnpm dev`
*   **Build**: `pnpm build`
*   **Production**: `pnpm start`
*   **Linting**: `pnpm lint`

---

## 📂 Project Structure

```text
├── src/app         # Next.js App Router (pages, layouts)
├── src/components  # UI components (Map, Game, Landing, Dialogs)
├── src/data        # Curated info JSON datasets
├── src/lib         # Game engine, store, utilities
├── public/data     # TopoJSON boundary map files
└── scripts         # Utility scripts (e.g., SW manifest generation)
```

---

## ⚖️ Data & Licensing

*   **Application Code**: The software application code is open for reference. See `LICENSE.md`.
*   **Restricted Datasets (Info JSON Files)**: The curated datasets (`src/data/bangladesh-districts.json`, `src/data/world_countries.json`, and associated metadata) are **proprietary**.
    *   Any use, reproduction, redistribution, adaptation, or incorporation of these info JSON files into external projects, products, or services requires **explicit prior written permission** from M. Aktaruzzaman Opu.
    *   **Without prior written permission, any use of the info JSON files is strictly prohibited.**

For permission inquiries, contact:
*   **Email**: `maopu.cse@gmail.com`
*   **Website**: [maopu.com.bd](https://maopu.com.bd)

© 2025 M. Aktaruzzaman Opu. All rights reserved.
