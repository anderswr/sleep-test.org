// FILE: www/lib/validate-id.ts (NEW FILE)
// Shared ID validation utility

const ID_REGEX = /^[a-zA-Z0-9_-]{11,24}$/;

/**
 * Validates and sanitizes a result ID.
 * Returns the sanitized string or null if invalid.
 */
export function validateId(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!ID_REGEX.test(trimmed)) return null;
  return trimmed;
}
