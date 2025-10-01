import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { TabDefinition, Tabs } from '../Tabs';

type ExampleTabsProps = {
  onTabChange?: (tabId: string) => void;
};

function ExampleTabs({ onTabChange }: ExampleTabsProps) {
  const tabs: TabDefinition[] = [
    {
      id: 'general',
      label: 'General',
      content: <div>General content</div>,
    },
    {
      id: 'permissions',
      label: 'Permissions',
      content: <div>Permissions content</div>,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      content: <div>Notifications content</div>,
    },
  ];

  const [currentTabId, setCurrentTabId] = useState(tabs[0].id);

  const handleTabChange = (tabId: string) => {
    onTabChange?.(tabId);
    setCurrentTabId(tabId);
  };

  return (
    <Tabs
      tabs={tabs}
      currentTabId={currentTabId}
      onTabChange={handleTabChange}
      ariaLabel="Account sections"
    />
  );
}

describe('Tabs', () => {
  it('uses roving tabindex and supports arrow key navigation', async () => {
    const onTabChange = vi.fn();

    render(<ExampleTabs onTabChange={onTabChange} />);

    const tablist = screen.getByRole('tablist', { name: 'Account sections' });
    expect(tablist).toBeInTheDocument();

    const generalTab = screen.getByRole('tab', { name: 'General' });
    const permissionsTab = screen.getByRole('tab', { name: 'Permissions' });
    const notificationsTab = screen.getByRole('tab', { name: 'Notifications' });

    expect(generalTab).toHaveAttribute('aria-selected', 'true');
    expect(generalTab).toHaveAttribute('tabindex', '0');
    expect(permissionsTab).toHaveAttribute('aria-selected', 'false');
    expect(permissionsTab).toHaveAttribute('tabindex', '-1');
    expect(notificationsTab).toHaveAttribute('aria-selected', 'false');
    expect(notificationsTab).toHaveAttribute('tabindex', '-1');

    generalTab.focus();
    expect(generalTab).toHaveFocus();

    fireEvent.keyDown(generalTab, { key: 'ArrowRight' });
    expect(permissionsTab).toHaveFocus();
    expect(permissionsTab).toHaveAttribute('aria-selected', 'true');
    expect(permissionsTab).toHaveAttribute('tabindex', '0');
    expect(generalTab).toHaveAttribute('tabindex', '-1');
    expect(onTabChange).toHaveBeenLastCalledWith('permissions');

    fireEvent.keyDown(permissionsTab, { key: 'End' });
    expect(notificationsTab).toHaveFocus();
    expect(notificationsTab).toHaveAttribute('aria-selected', 'true');
    expect(notificationsTab).toHaveAttribute('tabindex', '0');
    expect(onTabChange).toHaveBeenLastCalledWith('notifications');

    fireEvent.keyDown(notificationsTab, { key: 'ArrowLeft' });
    expect(permissionsTab).toHaveFocus();
    expect(onTabChange).toHaveBeenLastCalledWith('permissions');

    fireEvent.keyDown(permissionsTab, { key: 'Home' });
    expect(generalTab).toHaveFocus();
    expect(onTabChange).toHaveBeenLastCalledWith('general');
  });

  it('wires aria-controls and aria-labelledby for panels', async () => {
    render(<ExampleTabs />);

    const generalTab = screen.getByRole('tab', { name: 'General' });
    const permissionsTab = screen.getByRole('tab', { name: 'Permissions' });

    const generalPanelId = generalTab.getAttribute('aria-controls');
    expect(generalPanelId).toBeTruthy();

    const generalPanel = document.getElementById(generalPanelId!);
    expect(generalPanel).not.toBeNull();
    expect(generalPanel).toHaveAttribute('role', 'tabpanel');
    expect(generalPanel).toHaveAttribute('aria-labelledby', generalTab.id);
    expect(generalPanel).toBeVisible();

    const permissionsPanelId = permissionsTab.getAttribute('aria-controls');
    expect(permissionsPanelId).toBeTruthy();

    const permissionsPanel = document.getElementById(permissionsPanelId!);
    expect(permissionsPanel).not.toBeNull();
    expect(permissionsPanel).toHaveAttribute('role', 'tabpanel');
    expect(permissionsPanel).toHaveAttribute('aria-labelledby', permissionsTab.id);
    expect(permissionsPanel).not.toBeVisible();

    permissionsTab.focus();
    fireEvent.keyDown(permissionsTab, { key: 'Enter' });

    expect(permissionsPanel).toBeVisible();
    expect(generalPanel).not.toBeVisible();
  });
});
