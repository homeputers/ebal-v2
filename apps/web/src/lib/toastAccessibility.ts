const ASSERTIVE_TYPES = new Set(['error', 'warning']);

let dismissLabel = 'Dismiss notification';

function getRole(type?: string) {
  return ASSERTIVE_TYPES.has(type ?? '') ? 'alert' : 'status';
}

function getPoliteness(type?: string) {
  return ASSERTIVE_TYPES.has(type ?? '') ? 'assertive' : 'polite';
}

function enhanceToastElement(toast: HTMLElement) {
  const type = toast.getAttribute('data-type') ?? undefined;
  const role = getRole(type);
  const politeness = getPoliteness(type);

  toast.setAttribute('role', role);
  toast.setAttribute('aria-live', politeness);
  toast.setAttribute('aria-atomic', 'true');
  toast.setAttribute('tabindex', '-1');

  const closeButton = toast.querySelector<HTMLElement>('[data-close-button]');

  if (closeButton) {
    closeButton.setAttribute('type', 'button');
    closeButton.setAttribute('aria-label', dismissLabel);
  }
}

function applyToAllToasts() {
  const root = document.querySelector('[data-sonner-toaster]');

  if (!root) {
    return false;
  }

  root
    .querySelectorAll<HTMLElement>('[data-sonner-toast]')
    .forEach((toast) => enhanceToastElement(toast));

  return true;
}

function scheduleAfterNextFrame(callback: () => void) {
  if (typeof window === 'undefined') {
    return;
  }

  requestAnimationFrame(() => {
    if (typeof window === 'undefined') {
      return;
    }

    callback();
  });
}

export function scheduleToastAccessibility() {
  scheduleAfterNextFrame(() => {
    if (!applyToAllToasts()) {
      scheduleAfterNextFrame(() => {
        void applyToAllToasts();
      });
    }
  });
}

export function setToastDismissLabel(label: string) {
  dismissLabel = label;
  applyToAllToasts();
}

export function observeToastAccessibility() {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let observer: MutationObserver | undefined;
  let cancelled = false;

  const startObserving = () => {
    if (cancelled) {
      return;
    }

    const root = document.querySelector('[data-sonner-toaster]');

    if (!root) {
      scheduleAfterNextFrame(startObserving);
      return;
    }

    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches('[data-sonner-toast]')) {
              enhanceToastElement(node);
            } else {
              node
                .querySelectorAll<HTMLElement>('[data-sonner-toast]')
                .forEach((toast) => enhanceToastElement(toast));
            }
          }
        });

        if (
          mutation.type === 'attributes' &&
          mutation.target instanceof HTMLElement &&
          mutation.target.matches('[data-sonner-toast]')
        ) {
          enhanceToastElement(mutation.target);
        }
      });
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-type'],
      childList: true,
      subtree: true,
    });

    applyToAllToasts();
  };

  startObserving();

  return () => {
    cancelled = true;
    observer?.disconnect();
  };
}
