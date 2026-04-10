import { useAppNotifications } from '../../hooks/useAppNotifications';

/**
 * Global background component that monitors system events 
 * and triggers OS-level notifications.
 */
export function NotificationManager() {
  // Mount the Sentinel Hook
  useAppNotifications();

  return null; // This component operates entirely in the background
}
