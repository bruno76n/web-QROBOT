/**
 * Tiny store for "there are unsaved changes" (docs/12 §1). The editor sets it; the tabs, the list and
 * the browser's own "leave page" prompt read it.
 */

/** Whether the open editor has unsaved changes. */
let dirty = false;
/** True once the `beforeunload` listener is attached (it is added lazily, only in the browser). */
let listening = false;
/** Callbacks to run on every change of the flag. */
const subscribers = new Set<() => void>();

/** Asks the browser to confirm closing or reloading the page while there are unsaved changes. */
const beforeUnload = (event: BeforeUnloadEvent) => {
  if (dirty) {
    event.preventDefault();
    // Some browsers need a value; the text itself is never shown.
    event.returnValue = '';
  }
};

/** Sets the flag, attaches the leave-page listener on first use and notifies subscribers on change. */
export function setDirty(value: boolean): void {
  if (dirty === value) return;
  dirty = value;
  if (typeof window !== 'undefined' && !listening) {
    window.addEventListener('beforeunload', beforeUnload);
    listening = true;
  }
  subscribers.forEach((fn) => fn());
}

/** Current value of the flag. */
export const isDirty = () => dirty;

/** Registers a change callback; returns the function that unregisters it. */
export function subscribeDirty(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
