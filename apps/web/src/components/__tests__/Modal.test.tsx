import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from '@/test-utils/axe';
import { describe, expect, it, vi } from 'vitest';
import { useRef, useState } from 'react';

import Modal from '../Modal';
import { useHeaderPopover } from '@/hooks/useHeaderPopover';

describe('Modal', () => {
  it('renders dialog semantics with accessible labelling', async () => {
    const onClose = vi.fn();

    render(
      <Modal
        open
        onClose={onClose}
        closeLabel="Close dialog"
        titleId="modal-title"
        descriptionId="modal-description"
      >
        <h2 id="modal-title">Example modal</h2>
        <p id="modal-description">A description of the modal content.</p>
        <button type="button">Confirm</button>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Example modal' });
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus(),
    );

    const results = await axe(dialog.parentElement as HTMLElement);
    expect(results.violations).toHaveLength(0);
  });

  it('traps focus within the modal', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal open onClose={onClose} closeLabel="Close dialog" titleId="modal-title">
        <h2 id="modal-title">Focus order</h2>
        <input aria-label="First input" />
        <button type="button">Second button</button>
      </Modal>,
    );

    await waitFor(() =>
      expect(screen.getByLabelText('First input')).toHaveFocus(),
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Second button' })).toHaveFocus();

    await user.tab();
    const closeButton = screen.getByRole('button', { name: 'Close dialog' });
    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('First input')).toHaveFocus();

    await user.tab({ shift: true });
    expect(closeButton).toHaveFocus();
  });

  it('closes when pressing Escape and restores focus', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [open, setOpen] = useState(false);
      const buttonRef = useRef<HTMLButtonElement | null>(null);
      const finishRef = useRef<HTMLButtonElement | null>(null);

      return (
        <>
          <button ref={buttonRef} onClick={() => setOpen(true)}>
            Launch modal
          </button>
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            closeLabel="Close dialog"
            titleId="modal-title"
            initialFocusRef={finishRef}
          >
            <h2 id="modal-title">Keyboard close</h2>
            <button
              ref={finishRef}
              type="button"
              onClick={() => setOpen(false)}
            >
              Finish
            </button>
          </Modal>
        </>
      );
    }

    render(<Harness />);

    const launcher = screen.getByRole('button', { name: 'Launch modal' });
    await user.click(launcher);

    const finishButton = await screen.findByRole('button', { name: 'Finish' });
    expect(finishButton).toHaveFocus();

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(launcher).toHaveFocus();
  });

  it('supports disabling overlay close', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal
        open
        onClose={onClose}
        closeLabel="Close dialog"
        titleId="modal-title"
        closeOnOverlayClick={false}
      >
        <h2 id="modal-title">Overlay</h2>
        <button type="button">Action</button>
      </Modal>,
    );

    const overlay = document.querySelector('[role="presentation"]');
    expect(overlay).toBeTruthy();

    await user.click(overlay as Element);
    expect(onClose).not.toHaveBeenCalled();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when clicking the overlay', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal open onClose={onClose} closeLabel="Close dialog" titleId="modal-title">
        <h2 id="modal-title">Overlay</h2>
        <button type="button">Action</button>
      </Modal>,
    );

    const overlay = document.querySelector('[role="presentation"]');
    await user.click(overlay as Element);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('supports nested popovers without breaking dialog semantics', async () => {
    const user = userEvent.setup();

    function NestedPopover() {
      const { close, isOpen, toggle, triggerRef, popoverRef } =
        useHeaderPopover<HTMLDivElement>();

      return (
        <div>
          <button ref={triggerRef} type="button" onClick={toggle}>
            Toggle popover
          </button>
          {isOpen ? (
            <div
              ref={popoverRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="nested-popover-title"
              tabIndex={-1}
            >
              <h3 id="nested-popover-title">Nested actions</h3>
              <button
                type="button"
                onClick={() => close({ focusTrigger: true })}
              >
                Close popover
              </button>
            </div>
          ) : null}
        </div>
      );
    }

    render(
      <Modal open onClose={() => undefined} closeLabel="Close dialog" titleId="parent-modal">
        <h2 id="parent-modal">Parent modal</h2>
        <NestedPopover />
        <button type="button">Outside popover</button>
      </Modal>,
    );

    const popoverTrigger = screen.getByRole('button', { name: 'Toggle popover' });
    await user.click(popoverTrigger);

    const nestedDialog = await screen.findByRole('dialog', { name: 'Nested actions' });
    expect(nestedDialog).toBeInTheDocument();
    const closePopoverButton = screen.getByRole('button', { name: 'Close popover' });

    await waitFor(() => expect(closePopoverButton).toHaveFocus());

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Nested actions' })).not.toBeInTheDocument(),
    );

    expect(popoverTrigger).toHaveFocus();
    expect(screen.getByRole('dialog', { name: 'Parent modal' })).toBeInTheDocument();
  });
});
