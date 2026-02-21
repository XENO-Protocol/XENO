/**
 * core/awakening/notifier.ts -- System Notification Dispatch Layer
 *
 * Low-level wrapper around node-notifier for cross-platform
 * system-level notifications. Formats messages in XENO's
 * industrial terminal aesthetic.
 *
 * Supports: Windows (Toast/Balloon), macOS (Notification Center), Linux (notify-send).
 */

import notifier from 'node-notifier';
import { join } from 'path';
import type { AwakeningPriority } from '@/types/awakening';

const ICON_PATH = join(process.cwd(), 'public', 'xeno-logo.png');

const PRIORITY_PREFIX: Record<AwakeningPriority, string> = {
  LOW: '[--]',
  MEDIUM: '[>>]',
  HIGH: '[!!]',
  CRITICAL: '[##]',
};

/**
 * Dispatch a system-level notification.
 *
 * @returns true if notification was sent without error
 */
export function dispatchNotification(
  title: string,
  body: string,
  priority: AwakeningPriority = 'MEDIUM'
): Promise<boolean> {
  return new Promise((resolve) => {
    const prefix = PRIORITY_PREFIX[priority];
    const formattedTitle = `${prefix} XENO_PROTOCOL`;
    const formattedBody = `${title}\n---\n${body}`;

    notifier.notify(
      {
        title: formattedTitle,
        message: formattedBody,
        icon: ICON_PATH,
        sound: priority === 'CRITICAL' || priority === 'HIGH',
        wait: false,
        timeout: 8,
        appID: 'XENO_PROTOCOL',
      },
      (err) => {
        if (err) {
          console.error('[Awakening] Notification dispatch failed:', err.message);
          resolve(false);
        } else {
          console.log(`[Awakening] Notification dispatched: "${title}" [${priority}]`);
          resolve(true);
        }
      }
    );
  });
}

/**
 * Test the notification pipeline with a diagnostic ping.
 */
export async function dispatchTestPing(): Promise<boolean> {
  return dispatchNotification(
    'DIAGNOSTIC PING',
    'Notification subsystem operational. The abyss is listening.',
    'LOW'
  );
}