import { describe, expect, it, vi, afterEach } from "vitest";
import { developmentErrorDetails, errorReference, reportPageError } from "./app-errors";

afterEach(() => vi.restoreAllMocks());

describe("Page error diagnostics", () => {
  it("keeps a stable reference for an error and separates different errors", () => {
    const first = new Error("first");
    expect(errorReference(first)).toMatch(/^AUREVIA-[A-F0-9]{8}$/);
    expect(errorReference(first)).toBe(errorReference(first));
    expect(errorReference(new Error("second"))).not.toBe(errorReference(first));
  });
  it("never exposes technical details in production", () => {
    expect(developmentErrorDetails(new Error("private internal failure"), false)).toBeUndefined();
    expect(developmentErrorDetails({ balance: 123 }, false)).toBeUndefined();
  });
  it("shows the original stack only during development", () => {
    const error = new Error("diagnostic test");
    expect(developmentErrorDetails(error, true)).toBe(error.stack);
    expect(developmentErrorDetails({ secret: "do not stringify" }, true)).not.toContain("do not stringify");
  });
  it("logs the original error object, preserving its stack", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const error = new Error("original");
    reportPageError(error);
    expect(log).toHaveBeenCalledWith(expect.stringContaining(errorReference(error)), error);
  });
});