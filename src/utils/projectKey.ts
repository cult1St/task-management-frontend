/**
 * Suggest a short project key from a display name (e.g. "TaskFlow V2" → "TF").
 */
export function suggestProjectKey(name: string): string {
  const words = name
    .trim()
    .split(/[\s\-_]+/)
    .filter(Boolean);

  if (!words.length) return "";

  if (words.length === 1) {
    return words[0].replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();
  }

  return words
    .slice(0, 4)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
