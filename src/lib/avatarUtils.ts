// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function toAvatarSrc(avatar: any, mime = 'image/png'): Promise<string | undefined> {
  if (!avatar) return undefined;

  // If it's already a usable URL or data URL
  if (typeof avatar === 'string') {
    const s = avatar.trim();
    if (s.startsWith('http') || s.startsWith('/')) return s;
    if (s.startsWith('data:')) return s;

    // Base64-only string (common when server returns base64 payload without prefix)
    const base64Pattern = /^[A-Za-z0-9+/=\s]+$/;
    if (base64Pattern.test(s) && s.replace(/\s/g, '').length > 20) {
      return `data:${mime};base64,${s.replace(/\s/g, '')}`;
    }

    // JSON stringified array of bytes
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        const bytes = new Uint8Array(parsed);
        const blob = new Blob([bytes as BlobPart], { type: mime });
        return URL.createObjectURL(blob);
      }
    } catch {
      // ignore parse errors
    }
  }

  // Array<number> or Uint8Array
  if (Array.isArray(avatar) || avatar instanceof Uint8Array) {
    const bytes = avatar instanceof Uint8Array ? avatar : new Uint8Array(avatar);
    const blob = new Blob([bytes as BlobPart], { type: mime });
    return URL.createObjectURL(blob);
  }

  // ArrayBuffer
  if (avatar instanceof ArrayBuffer) {
    const blob = new Blob([avatar], { type: mime });
    return URL.createObjectURL(blob);
  }

  // Blob/File
  if (avatar instanceof Blob) {
    return URL.createObjectURL(avatar);
  }

  return undefined;
}
