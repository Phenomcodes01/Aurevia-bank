import { reportLovableError } from "./lovable-error-reporting";

/** Reference stays stable for the lifetime of an error without retaining it. */
const references = new WeakMap<object, string>();

export function errorReference(error: unknown): string {
  if (typeof error !== "object" || error === null) return "AUREVIA-UNKNOWN";
  const existing = references.get(error);
  if (existing) return existing;
  const reference = `AUREVIA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  references.set(error, reference);
  return reference;
}

export function reportPageError(error: unknown): void {
  const reference = errorReference(error);
  // Keep the original Error object: replacing it with its message loses the stack.
  console.error(`[Aurevia Bank] Page failed (${reference})`, error);
  reportLovableError(error, { boundary: "aurevia_page_error", reference });
}

/** Never place stack traces, customer records or browser storage in the public UI. */
export function developmentErrorDetails(error: unknown, development: boolean): string | undefined {
  if (!development) return undefined;
  if (error instanceof Error) return error.stack ?? `${error.name}: ${error.message}`;
  if (error instanceof Response) return `Request failed with status ${error.status}`;
  return "An unexpected value was thrown. Inspect the original error in the console.";
}