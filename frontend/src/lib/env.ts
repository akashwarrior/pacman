const HTTP_PROTOCOLS = new Set(["http:", "https:"]);
const WS_PROTOCOLS = new Set(["ws:", "wss:"]);

function normalizeUrl(
  value: string | undefined,
  allowedProtocols: Set<string>,
): string | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());
    if (!allowedProtocols.has(url.protocol)) {
      return null;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getBackendApiUrl(): string | null {
  return normalizeUrl(process.env.NEXT_PUBLIC_BACKEND_URL, HTTP_PROTOCOLS);
}

export function getWebSocketUrl(): string | null {
  return normalizeUrl(process.env.NEXT_PUBLIC_WS_URL, WS_PROTOCOLS);
}
