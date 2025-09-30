import { RefObject, useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'area[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([aria-hidden="true"]):not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"]):not([tabindex="-1"])',
  'select:not([disabled]):not([aria-hidden="true"]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([aria-hidden="true"]):not([tabindex="-1"])',
  'iframe:not([tabindex="-1"])',
  '[contenteditable="true"]:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

type FocusContainer = ParentNode & EventTarget;

function focusElement(element: HTMLElement | null) {
  if (!element) return;

  try {
    element.focus({ preventScroll: true });
  } catch (error) {
    element.focus();
  }
}

function isHidden(element: HTMLElement): boolean {
  return (
    element.hasAttribute('hidden') ||
    element.getAttribute('aria-hidden') === 'true' ||
    element.style.display === 'none' ||
    element.style.visibility === 'hidden'
  );
}

function getFocusableElements(container: FocusContainer | null): HTMLElement[] {
  if (!container || !('querySelectorAll' in container)) {
    return [];
  }

  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );

  return elements.filter((element) => !isHidden(element));
}

function isFocusable(element: HTMLElement): boolean {
  if (element.hasAttribute('disabled')) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;

  if (typeof element.tabIndex === 'number' && element.tabIndex >= 0) {
    return true;
  }

  if (element.matches(FOCUSABLE_SELECTOR)) {
    return true;
  }

  return false;
}

export function focusFirst(container?: FocusContainer | null): HTMLElement | null {
  if (!isBrowser) {
    return null;
  }

  const focusTarget =
    getFocusableElements(container ?? document).at(0) ??
    (container instanceof HTMLElement && isFocusable(container) ? container : null);

  focusElement(focusTarget ?? null);

  return focusTarget ?? null;
}

export function focusLast(container?: FocusContainer | null): HTMLElement | null {
  if (!isBrowser) {
    return null;
  }

  const focusable = getFocusableElements(container ?? document);
  const focusTarget =
    focusable.at(-1) ??
    (container instanceof HTMLElement && isFocusable(container) ? container : null);

  focusElement(focusTarget ?? null);

  return focusTarget ?? null;
}

type TrapFocusOptions = {
  initialFocus?: HTMLElement | null;
};

export function trapFocus(
  container: HTMLElement | null,
  options: TrapFocusOptions = {},
): () => void {
  if (!isBrowser || !container) {
    return () => {};
  }

  const { initialFocus } = options;
  const previouslyFocused = document.activeElement as HTMLElement | null;
  let lastDirection: 'forward' | 'backward' = 'forward';

  const ensureFocus = () => {
    const active = document.activeElement;

    if (!container.contains(active)) {
      if (lastDirection === 'backward') {
        focusLast(container);
      } else {
        focusFirst(container);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') {
      return;
    }

    const focusable = getFocusableElements(container);

    if (focusable.length === 0) {
      if (!isFocusable(container)) {
        container.setAttribute('tabindex', '-1');
      }

      focusElement(container);
      event.preventDefault();
      return;
    }

    const activeElement = document.activeElement as HTMLElement | null;
    const currentIndex = activeElement ? focusable.indexOf(activeElement) : -1;
    lastDirection = event.shiftKey ? 'backward' : 'forward';

    if (event.shiftKey) {
      const previousIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
      focusElement(focusable[previousIndex]);
      event.preventDefault();
      return;
    }

    const nextIndex = currentIndex === focusable.length - 1 ? 0 : currentIndex + 1;
    focusElement(focusable[nextIndex]);
    event.preventDefault();
  };

  const handleFocusIn = (event: FocusEvent) => {
    if (!container.contains(event.target as Node)) {
      ensureFocus();
    }
  };

  const doc = container.ownerDocument ?? document;

  doc.addEventListener('focusin', handleFocusIn);
  container.addEventListener('keydown', handleKeyDown);

  let initialTarget: HTMLElement | null = null;

  if (initialFocus && container.contains(initialFocus)) {
    initialTarget = initialFocus;
    focusElement(initialTarget);
  } else {
    initialTarget = focusFirst(container);
  }

  return () => {
    doc.removeEventListener('focusin', handleFocusIn);
    container.removeEventListener('keydown', handleKeyDown);

    if (previouslyFocused && previouslyFocused.isConnected) {
      focusElement(previouslyFocused);
    }
  };
}

type FocusReturnOptions = {
  enabled?: boolean;
};

export function useFocusReturn<T extends HTMLElement>(
  ref: RefObject<T>,
  options: FocusReturnOptions = {},
) {
  const { enabled = true } = options;
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isBrowser || !enabled) {
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    return () => {
      const previous = previousFocusRef.current;

      if (previous && previous.isConnected) {
        focusElement(previous);
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (!isBrowser || !enabled) {
      return;
    }

    const node = ref.current;

    if (!node) {
      return;
    }

    const active = node.ownerDocument?.activeElement as HTMLElement | null;

    if (!active || !node.contains(active)) {
      focusFirst(node);
    }
  }, [enabled, ref]);
}

export { getFocusableElements };
