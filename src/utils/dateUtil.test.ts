import { describe, expect, it } from "vitest";
import { formatShortDate, formatRelativeTime, parseBackendDate } from "./dateUtil";

describe("dateUtil", () => {
  it("formats ISO dates into short strings", () => {
    expect(formatShortDate("2026-03-17")).toMatch(/Mar\s*17/i);
  });

  it("returns fallback when value is invalid", () => {
    expect(formatShortDate("not-a-date")).toBe("No date");
    expect(parseBackendDate(null)).toBeNull();
    expect(parseBackendDate("invalid")).toBeNull();
  });

  it("formats relative time for recent dates", () => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60_000).toISOString();
    expect(formatRelativeTime(oneMinuteAgo)).toContain("m ago");
  });
});
