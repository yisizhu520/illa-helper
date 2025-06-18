/**
 * Messaging Module
 * Handles communication between different parts of the extension.
 */

import { UserSettings } from './types';
import { browser } from 'wxt/browser';

/**
 * Notifies the active tab that the settings have been updated.
 * @param settings The new settings to be sent.
 */
export async function notifySettingsChanged(
  settings: UserSettings,
): Promise<void> {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs[0]?.id) {
      await browser.tabs.sendMessage(tabs[0].id, {
        type: 'settings_updated',
        settings: settings,
      });
    }
  } catch (error) {
    console.error('Failed to send settings_updated message:', error);
  }
}
