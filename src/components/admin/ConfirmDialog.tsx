import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface ConfirmOptions {
  title: string;
  text?: string;
  yes: string;
  no: string;
  danger?: boolean;
}

type Confirm = (options: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = createContext<Confirm>(() => Promise.resolve(false));

export const useConfirm = () => useContext(ConfirmContext);

/** One shared modal for "are you sure" questions, built on the native <dialog>. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const confirm = useCallback<Confirm>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  useEffect(() => {
    if (options && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [options]);

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
