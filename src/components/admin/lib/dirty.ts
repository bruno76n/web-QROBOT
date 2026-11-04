/**
 * Tiny store for "there are unsaved changes" (docs/12 §1). The editor sets it; the tabs, the list and
 * the browser's own "leave page" prompt read it.
 */
let dirty = false;
let listening = false;
const subscribers = new Set<() => void>();

const beforeUnload = (event: BeforeUnloadEvent) => {
  if (dirty) {
    event.preventDefault();
    // Some browsers need a value; the text itself is never shown.
    event.returnValue = '';
  }
};

export function setDirty(value: boolean): void {
  if (dirty === value) return;
  dirty = value;
  if (typeof window !== 'undefined' && !listening) {
    window.addEventListener('beforeunload', beforeUnload);
    listening = true;
  }
  subscribers.forEach((fn) => fn());
}

export const isDirty = () => dirty;

export function subscribeDirty(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
