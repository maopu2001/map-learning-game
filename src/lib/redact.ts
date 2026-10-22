/**
 * Pure zero-dependency redaction utility for Detective Mode.
 * Masks direct target identifiers (name, aliases, capital, division)
 * and capitalized proper nouns in trivia facts.
 */

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function redactTrivia(
  text: string,
  targetWords: (string | undefined | null)[],
  revealedRatio = 0,
): string {
  if (!text) return "";
  if (revealedRatio >= 1) return text;

  // 1. Direct target identity words (name, capital, aliases, division)
  const blacklist = targetWords
    .filter(Boolean)
    .flatMap((w) => String(w).split(/[\s,/-]+/))
    .map((w) => w.trim())
    .filter((w) => w.length >= 3);

  const escapedBlacklist = Array.from(new Set(blacklist)).map(escapeRegex);

  let result = text;

  // Mask exact identity words (always masked in redacted mode)
  if (escapedBlacklist.length > 0) {
    const idRegex = new RegExp(
      "\\b(?:" + escapedBlacklist.join("|") + ")\\b",
      "gi",
    );
    result = result.replace(idRegex, (m) => "█".repeat(Math.min(m.length, 6)));
  }

  // 2. Mask proper nouns (Unicode-aware capitalized words not preceded by sentence endings)
  const properNounRegex = /(?<!^|[.!?]\s+)\b\p{Lu}\p{Ll}{2,}\b/gu;

  let properIndex = 0;
  result = result.replace(properNounRegex, (m) => {
    properIndex++;
    // If partially revealed through hints (e.g. ratio = 0.5), unmask alternate proper nouns
    if (revealedRatio > 0 && properIndex % 2 === 0) return m;
    return "█".repeat(Math.min(m.length, 6));
  });

  return result;
}
