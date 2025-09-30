import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { focusFirst, focusLast, trapFocus, useFocusReturn } from './a11y';
import { useRef } from 'react';

function createFocusableContainer() {
  const container = document.createElement('div');

  container.innerHTML = `
    <button type="button">Alpha</button>
    <input type="text" value="bravo" />
    <a href="#charlie">Charlie</a>
  `;

  document.body.appendChild(container);

  return container;
}

describe('focus utilities', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('focusFirst', () => {
    it('moves focus to the first focusable descendant', () => {
      const container = createFocusableContainer();

      const result = focusFirst(container);

      expect(result).toBe(container.querySelector('button'));
      expect(document.activeElement).toBe(result);
    });

    it('falls back to the container when it is focusable and empty', () => {
      const container = document.createElement('div');
      container.tabIndex = 0;
      document.body.appendChild(container);

      const result = focusFirst(container);

      expect(result).toBe(container);
      expect(document.activeElement).toBe(container);
    });
  });

  describe('focusLast', () => {
    it('moves focus to the last focusable descendant', () => {
      const container = createFocusableContainer();

      const result = focusLast(container);

      const link = container.querySelector('a');
      expect(result).toBe(link);
      expect(document.activeElement).toBe(link);
    });
  });

  describe('trapFocus', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('cycles focus within the container when tabbing forward and backward', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button type="button">First</button>
        <button type="button">Second</button>
        <button type="button">Third</button>
      `;

      document.body.appendChild(container);

      const [first, second, third] = Array.from(
        container.querySelectorAll<HTMLButtonElement>('button'),
      );

      const release = trapFocus(container);

      first.focus();

      fireEvent.keyDown(first, { key: 'Tab' });
      expect(document.activeElement).toBe(second);

      fireEvent.keyDown(second, { key: 'Tab' });
      expect(document.activeElement).toBe(third);

      fireEvent.keyDown(third, { key: 'Tab' });
      expect(document.activeElement).toBe(first);

      fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(third);

      release();
    });

    it('restores previously focused element when released', () => {
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.textContent = 'Open';
      document.body.appendChild(trigger);
      trigger.focus();

      const container = createFocusableContainer();

      const release = trapFocus(container);

      expect(document.activeElement).not.toBe(trigger);

      release();

      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('useFocusReturn', () => {
    const TestComponent = () => {
      const ref = useRef<HTMLDivElement>(null);
      useFocusReturn(ref);

      return (
        <div ref={ref}>
          <button type="button">One</button>
          <button type="button">Two</button>
        </div>
      );
    };

    it('focuses the first focusable element on mount and restores focus on unmount', () => {
      const outside = document.createElement('button');
      outside.type = 'button';
      outside.textContent = 'Outside';
      document.body.appendChild(outside);
      outside.focus();

      const { unmount } = render(<TestComponent />);

      expect(document.activeElement?.textContent).toBe('One');

      unmount();

      expect(document.activeElement).toBe(outside);
    });

    it('allows disabling via options', () => {
      const outside = document.createElement('button');
      outside.type = 'button';
      outside.textContent = 'Outside';
      document.body.appendChild(outside);
      outside.focus();

      const Component = () => {
        const ref = useRef<HTMLDivElement>(null);
        useFocusReturn(ref, { enabled: false });

        return (
          <div ref={ref}>
            <button type="button">One</button>
          </div>
        );
      };

      const { unmount } = render(<Component />);

      expect(document.activeElement).toBe(outside);

      unmount();
      expect(document.activeElement).toBe(outside);
    });
  });
});
