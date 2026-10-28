const sensitiveKeys = new Set(["routingnumber", "accountnumber", "ssn", "socialsecuritynumber"]);

/** Remove every duplicate of sensitive numbers before crossing the admin API boundary. */
export function redactNumbers(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactNumbers);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sensitiveKeys.has(key.replace(/[^a-z0-9]/gi, "").toLowerCase())
          ? item
            ? "••••••••"
            : item
          : redactNumbers(item),
      ]),
    );
  }
  return value;
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
