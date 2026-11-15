/**
 * Admin scratchpad — quick notes for the site owner, saved per device in
 * localStorage. No server involved: notes never leave this browser.
 */

export const NOTES_KEY = "mytechflow_notes_v1";

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createNote(title = "", body = "") {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title: String(title).trim(),
    body: String(body),
    createdAt: now,
    updatedAt: now,
  };
}

/** Returns [] when nothing is stored or the stored value is damaged. */
export function readNotes(storage) {
  try {
    const raw = JSON.parse(storage?.getItem(NOTES_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((note) => note && typeof note.id === "string");
  } catch {
    return [];
  }
}

export function writeNotes(storage, notes) {
  try {
    storage?.setItem(NOTES_KEY, JSON.stringify(notes || []));
    return true;
  } catch {
    return false;
  }
}

/** Add a new note, or replace the one with the same id (newest first). */
export function upsertNote(notes, note) {
  const next = [...(notes || [])];
  const stamped = { ...note, updatedAt: new Date().toISOString() };
  const index = next.findIndex((item) => item.id === note.id);
  if (index >= 0) next[index] = stamped;
  else next.unshift(stamped);
  return next;
}

export function deleteNote(notes, id) {
  return (notes || []).filter((note) => note.id !== id);
}
