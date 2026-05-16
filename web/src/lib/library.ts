// Local document library — stored in localStorage so v1 needs no backend.
// Each device gets its own library; we can layer Supabase auth on later
// without changing the doc shape.

const KEY = 'neurolex.library.v1';

export type SavedDoc = {
  id: string;
  title: string;
  text: string;
  createdAt: number;
  updatedAt: number;
  settings: DocSettings;
};

export type DocSettings = {
  bionic: boolean;
  boldRatio: number;
  fontFamily: string;
  fontSize: number;
  theme: 'dark' | 'cream' | 'high-contrast';
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
};

export const DEFAULT_SETTINGS: DocSettings = {
  bionic: true,
  boldRatio: 0.5,
  fontFamily: 'Verdana',
  fontSize: 20,
  theme: 'dark',
  lineHeight: 1.6,
  letterSpacing: 0,
  wordSpacing: 0,
};

function read(): SavedDoc[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(docs: SavedDoc[]): void {
  localStorage.setItem(KEY, JSON.stringify(docs));
}

export function listDocs(): SavedDoc[] {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getDoc(id: string): SavedDoc | undefined {
  return read().find((d) => d.id === id);
}

export function saveDoc(input: Omit<SavedDoc, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): SavedDoc {
  const now = Date.now();
  const docs = read();
  const id = input.id ?? cryptoRandomId();
  const existing = docs.find((d) => d.id === id);
  const doc: SavedDoc = existing
    ? { ...existing, ...input, id, updatedAt: now }
    : { ...input, id, createdAt: now, updatedAt: now };
  const next = existing ? docs.map((d) => (d.id === id ? doc : d)) : [doc, ...docs];
  write(next);
  return doc;
}

export function deleteDoc(id: string): void {
  write(read().filter((d) => d.id !== id));
}

function cryptoRandomId(): string {
  // Browser-safe short ID; not cryptographically critical but stable + unique.
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── Sharing via URL hash ──────────────────────────────────────────────
// Encode (text + settings) into a #share=... fragment so a recipient can
// open the same view without any backend. Uses base64-encoded JSON.

export type SharePayload = {
  title?: string;
  text: string;
  settings: DocSettings;
};

export function encodeShare(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  // btoa can't handle multibyte UTF-8 directly; encode first.
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeShare(encoded: string): SharePayload | null {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/') +
      '==='.slice(0, (4 - (encoded.length % 4)) % 4);
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (typeof parsed?.text !== 'string' || !parsed.settings) return null;
    return parsed as SharePayload;
  } catch {
    return null;
  }
}

export function buildShareUrl(payload: SharePayload): string {
  const enc = encodeShare(payload);
  // Use URL hash so this works on any static host (incl. github.io)
  // without server-side rewrites.
  const base = `${location.origin}${location.pathname}`;
  return `${base}#share=${enc}`;
}

export function readShareFromHash(): SharePayload | null {
  const hash = location.hash || '';
  const m = hash.match(/^#share=(.+)$/);
  if (!m) return null;
  return decodeShare(m[1]!);
}
