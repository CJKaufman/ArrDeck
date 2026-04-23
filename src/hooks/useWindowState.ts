import { useEffect } from 'react';
import { restoreStateCurrent, StateFlags } from '@tauri-apps/plugin-window-state';

export function useWindowState() {
  useEffect(() => {
    // Safety check: Only run window state logic if we are in a Tauri environment
    if (!('__TAURI_INTERNALS__' in window)) {
       return;
    }

    try {
      // The official plugin automatically saves state via the Rust backend.
      // We manually call restore here to ensure the state applies immediately upon React mount
      // and perfectly restores the exact bounds, maximized state, and monitor target.
      restoreStateCurrent(StateFlags.ALL);
    } catch (e) {
      console.warn('[WINDOW] Failed to apply native window state:', e);
    }
  }, []);
}
