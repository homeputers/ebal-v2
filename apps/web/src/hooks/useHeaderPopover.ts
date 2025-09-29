import { useCallback, useEffect, useRef, useState } from 'react';

type CloseOptions = {
  focusTrigger?: boolean;
};

export function useHeaderPopover<T extends HTMLElement = HTMLDivElement>() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<T | null>(null);
  const shouldFocusTriggerRef = useRef(false);

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

      close();
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (isEventInside(event.target)) {
        return;
      }

      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close({ focusTrigger: true });
      }
    };

    const pointerEventName =
      typeof window !== 'undefined' && 'PointerEvent' in window
        ? 'pointerdown'
        : 'mousedown';

    document.addEventListener(pointerEventName, handlePointerDown);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener(pointerEventName, handlePointerDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, isOpen]);

  useEffect(() => {
    if (!isOpen && shouldFocusTriggerRef.current) {
      shouldFocusTriggerRef.current = false;
      triggerRef.current?.focus();
    }
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
