import { useCallback, useEffect, useRef, useState } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
];

const getFocusableElements = (container: HTMLElement | null) => {
  if (!container) {
    return [];
  }

  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS.join(',')),
  );

  return elements.filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.tabIndex !== -1 &&
      element.getAttribute('aria-hidden') !== 'true',
  );
};

type CloseOptions = {
  focusTrigger?: boolean;
};

export function useHeaderPopover<T extends HTMLElement = HTMLDivElement>() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<T | null>(null);
  const shouldFocusTriggerRef = useRef(false);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const close = useCallback(
    ({ focusTrigger = false }: CloseOptions = {}) => {
      if (focusTrigger) {
        shouldFocusTriggerRef.current = true;
      }
      setIsOpen(false);
    },
    [],
  );

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const isEventInside = (node: EventTarget | null) => {
      if (!(node instanceof Node)) {
        return false;
      }

      return (
        !!triggerRef.current?.contains(node) ||
        !!popoverRef.current?.contains(node)
      );
    };

    const handlePointerDown = (event: Event) => {
      if (isEventInside(event.target)) {
        return;
      }

      close({ focusTrigger: true });
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;

      if (target && popoverRef.current?.contains(target)) {
        return;
      }

      if (triggerRef.current?.contains(target ?? null)) {
        return;
      }

      close({ focusTrigger: true });
    };

    const pointerEventName =
      typeof window !== 'undefined' && 'PointerEvent' in window
        ? 'pointerdown'
        : 'mousedown';

    document.addEventListener(pointerEventName, handlePointerDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener(pointerEventName, handlePointerDown);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [close, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (typeof document === 'undefined') {
      return;
    }

    previousActiveElementRef.current =
      (document.activeElement as HTMLElement | null) ?? null;

    const popover = popoverRef.current;

    if (!popover) {
      return;
    }

    const focusFirstElement = () => {
      const focusable = getFocusableElements(popover);

      if (focusable.length > 0) {
        focusable[0].focus({ preventScroll: true });
        return;
      }

      popover.focus({ preventScroll: true });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const node = popoverRef.current;

      if (!node) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        close({ focusTrigger: true });
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements(node);

      if (focusable.length === 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
        node.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        event.stopImmediatePropagation();
        first.focus({ preventScroll: true });
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        event.stopImmediatePropagation();
        last.focus({ preventScroll: true });
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      const node = popoverRef.current;

      if (!node) {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (!target || node.contains(target)) {
        return;
      }

      const focusable = getFocusableElements(node);

      if (focusable.length > 0) {
        focusable[0].focus({ preventScroll: true });
        return;
      }

      node.focus({ preventScroll: true });
    };

    requestAnimationFrame(focusFirstElement);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [close, isOpen]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    if (shouldFocusTriggerRef.current) {
      shouldFocusTriggerRef.current = false;
      triggerRef.current?.focus({ preventScroll: true });
    } else {
      const previous = previousActiveElementRef.current;

      if (previous && previous.isConnected) {
        previous.focus({ preventScroll: true });
      }
    }

    previousActiveElementRef.current = null;
  }, [isOpen]);

  return {
    close,
    isOpen,
    open,
    popoverRef,
    toggle,
    triggerRef,
  } as const;
}
