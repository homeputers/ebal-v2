import {
  type MutableRefObject,
  type PointerEventHandler,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
];

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  closeLabel: string;
  titleId?: string;
  descriptionId?: string;
  initialFocusRef?: MutableRefObject<HTMLElement | null>;
  closeOnOverlayClick?: boolean;
  contentClassName?: string;
}

export default function Modal({
  open,
  onClose,
  children,
  closeLabel,
  titleId,
  descriptionId,
  initialFocusRef,
  closeOnOverlayClick = true,
  contentClassName,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const focusFirstInteractive = useCallback(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const preferred = initialFocusRef?.current;

    if (preferred && dialog.contains(preferred)) {
      preferred.focus({ preventScroll: true });
      return;
    }

    const autoFocusCandidate = dialog.querySelector<HTMLElement>('[data-autofocus]');

    if (
      autoFocusCandidate &&
      !autoFocusCandidate.hasAttribute('disabled') &&
      autoFocusCandidate.tabIndex !== -1
    ) {
      autoFocusCandidate.focus({ preventScroll: true });
      return;
    }

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS.join(',')),
    ).filter(
      (el) =>
        !el.hasAttribute('disabled') &&
        el.tabIndex !== -1 &&
        !el.hasAttribute('data-modal-close'),
    );

    if (focusable.length > 0) {
      focusable[0].focus({ preventScroll: true });
      return;
    }

    dialog.focus({ preventScroll: true });
  }, [initialFocusRef]);

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return undefined;
    }

    previousActiveElement.current = document.activeElement as HTMLElement | null;

    focusFirstInteractive();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const node = dialogRef.current;
      if (!node) {
        return;
      }

      const focusable = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS.join(',')),
      ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);

      if (focusable.length === 0) {
        event.preventDefault();
        node.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const previous = previousActiveElement.current;
      if (previous && previous.isConnected) {
        previous.focus({ preventScroll: true });
      }
      previousActiveElement.current = null;
    };
  }, [focusFirstInteractive, onClose, open]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const handleOverlayPointerDown: PointerEventHandler<HTMLDivElement> = (
    event,
  ) => {
    if (!closeOnOverlayClick) {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    event.preventDefault();
    onClose();
  };

  const portalTarget = document.body;
  const mergedContentClassName =
    contentClassName ?? 'w-full max-w-md rounded bg-white p-4 shadow outline-none';

  return createPortal(
    <>
      <div
        role="presentation"
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/50"
        onPointerDown={handleOverlayPointerDown}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={mergedContentClassName}
          tabIndex={-1}
        >
          <button
            type="button"
            onClick={onClose}
            className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:rounded focus:bg-white focus:px-3 focus:py-1 focus:text-sm focus:font-medium focus:shadow focus:outline-none"
            data-modal-close
          >
            {closeLabel}
          </button>
          {children}
        </div>
      </div>
    </>,
    portalTarget,
  );
}
