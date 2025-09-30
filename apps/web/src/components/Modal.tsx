import { type ReactNode, useEffect, useRef } from 'react';
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
  contentClassName?: string;
}

export default function Modal({
  open,
  onClose,
  children,
  closeLabel,
  titleId,
  contentClassName,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return undefined;
    }

    previousActiveElement.current = document.activeElement as HTMLElement | null;

    const dialog = dialogRef.current;
    dialog?.focus({ preventScroll: true });

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
      previousActiveElement.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const portalTarget = document.body;
  const mergedContentClassName =
    contentClassName ?? 'w-full max-w-md rounded bg-white p-4 shadow outline-none';

  return createPortal(
    <>
      <button
        type="button"
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50"
        aria-label={closeLabel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={mergedContentClassName}
          tabIndex={-1}
        >
          {children}
        </div>
      </div>
    </>,
    portalTarget,
  );
}
