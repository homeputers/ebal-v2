import { forwardRef, type HTMLAttributes } from 'react';

export type VisuallyHiddenProps = HTMLAttributes<HTMLSpanElement>;

export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ className, ...props }, ref) => {
    const mergedClassName = ['sr-only', className].filter(Boolean).join(' ');

    return <span ref={ref} className={mergedClassName} {...props} />;
  },
);

VisuallyHidden.displayName = 'VisuallyHidden';

export default VisuallyHidden;
