import { ComponentPropsWithoutRef, ReactNode, forwardRef, useCallback, useEffect, useRef } from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type PageHeadingProps = {
  /**
   * Heading level (h1-h6). Defaults to `h1`.
   */
  level?: HeadingLevel;
  /**
   * When `true`, focus moves to the heading after mount. Opt-in to avoid focus churn.
   */
  autoFocus?: boolean;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'h1'>, 'children'>;

const createHeadingTag = (level: HeadingLevel) => `h${level}` as const;

export const PageHeading = forwardRef<HTMLHeadingElement, PageHeadingProps>(
  function PageHeading(
    { level = 1, autoFocus = false, className, tabIndex, children, ...rest },
    forwardedRef,
  ) {
    const elementRef = useRef<HTMLHeadingElement | null>(null);

    const assignRef = useCallback(
      (node: HTMLHeadingElement | null) => {
        elementRef.current = node;

        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );

    useEffect(() => {
      if (!autoFocus) {
        return;
      }

      if (typeof window === 'undefined') {
        return;
      }

      const node = elementRef.current;

      if (!node) {
        return;
      }

      const frame = window.requestAnimationFrame(() => {
        if (!node.isConnected) {
          return;
        }

        try {
          node.focus({ preventScroll: true });
        } catch {
          node.focus();
        }
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }, [autoFocus]);

    const HeadingTag = createHeadingTag(level);
    const resolvedTabIndex = tabIndex ?? (autoFocus ? -1 : undefined);

    return (
      <HeadingTag
        {...rest}
        ref={assignRef}
        className={className}
        tabIndex={resolvedTabIndex}
        data-page-heading={autoFocus ? 'true' : undefined}
      >
        {children}
      </HeadingTag>
    );
  },
);

export default PageHeading;
