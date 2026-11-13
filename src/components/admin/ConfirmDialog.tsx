/** Promise-based confirmation modal: a provider renders one dialog and `useConfirm` asks it questions. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/** Texts of one question; `danger` styles the "yes" button as destructive. */
interface ConfirmOptions {
  title: string;
  text?: string;
  yes: string;
  no: string;
  danger?: boolean;
}

/** Opens the dialog and resolves to true (yes) or false (no, Escape). */
type Confirm = (options: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = createContext<Confirm>(() => Promise.resolve(false));

/** Returns the `confirm` function; without a provider it always answers false. */
export const useConfirm = () => useContext(ConfirmContext);

/**
 * One shared modal for "are you sure" questions, built on the native <dialog>. Only one question
 * is open at a time; Escape counts as "no".
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  /** Resolves the promise of the question currently open. */
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const confirm = useCallback<Confirm>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  // Shows the modal (focus trap and backdrop come from the browser) whenever a question is set.
  useEffect(() => {
    if (options && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [options]);

  /** Closes the dialog, answers the pending promise and clears the question. */
  const close = (value: boolean) => {
    dialog.current?.close();
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options ? (
        <dialog
          ref={dialog}
          className="dlg"
          aria-labelledby="confirm-title"
          onCancel={(e) => {
            e.preventDefault();
            close(false);
          }}
        >
          <div className="in-dlg">
            <h2 id="confirm-title">{options.title}</h2>
            {options.text ? <p>{options.text}</p> : null}
            <div className="row-b">
              <button type="button" className="b" onClick={() => close(false)}>
                {options.no}
              </button>
              <button
                type="button"
                className={options.danger ? 'b dan' : 'b pri'}
                onClick={() => close(true)}
              >
                {options.yes}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </ConfirmContext.Provider>
  );
}
