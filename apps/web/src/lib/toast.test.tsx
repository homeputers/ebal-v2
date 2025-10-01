import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/announcer', async () => {
  const actual = await vi.importActual<typeof import('@/lib/announcer')>('@/lib/announcer');

  return {
    ...actual,
    announce: vi.fn(),
  };
});

import { AccessibleToaster } from '@/components/a11y/AccessibleToaster';
import { toast } from '@/lib/toast';
import { announce } from '@/lib/announcer';
import '@/i18n';

const announceMock = vi.mocked(announce);

describe('toast accessibility', () => {
  beforeEach(() => {
    announceMock.mockClear();
  });

  it('announces success toasts politely', async () => {
    render(<AccessibleToaster />);

    toast.success('Saved successfully');

    await waitFor(() => {
      expect(announceMock).toHaveBeenCalledWith('Saved successfully', 'polite');
    });
  });

  it('announces error toasts assertively', async () => {
    render(<AccessibleToaster />);

    toast.error('Something went wrong');

    await waitFor(() => {
      expect(announceMock).toHaveBeenCalledWith('Something went wrong', 'assertive');
    });
  });

  it('adds live region roles and keeps focus on the current element', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button">Focus me</button>
        <AccessibleToaster />
      </div>,
    );

    const focusButton = screen.getByRole('button', { name: 'Focus me' });
    await user.click(focusButton);

    expect(document.activeElement).toBe(focusButton);

    toast.error('Focus should stay here');

    await waitFor(() => {
      expect(document.querySelector('[data-sonner-toast]')).not.toBeNull();
    });

    const toastElement = document.querySelector<HTMLElement>('[data-sonner-toast]');

    expect(toastElement).not.toBeNull();

    if (!toastElement) {
      throw new Error('Toast element not found');
    }

    await waitFor(() => {
      expect(toastElement).toHaveAttribute('role', 'alert');
      expect(toastElement).toHaveAttribute('aria-live', 'assertive');
      expect(toastElement).toHaveAttribute('aria-atomic', 'true');
      expect(toastElement).toHaveAttribute('tabindex', '-1');
    });

    const dismissButton = await screen.findByRole('button', {
      name: /dismiss notification/i,
    });

    expect(dismissButton).toBeInTheDocument();

    await waitFor(() => {
      expect(document.activeElement).toBe(focusButton);
    });
  });
});
