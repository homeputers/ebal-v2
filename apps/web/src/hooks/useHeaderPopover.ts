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

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
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

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
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
