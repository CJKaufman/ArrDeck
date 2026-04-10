import { useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { LazyStore } from '@tauri-apps/plugin-store';

const store = new LazyStore('window-state.json');

export function useWindowState() {
  useEffect(() => {
    // Safety check: Only run window state logic if we are in a Tauri environment
    let appWindow: any;
    try {
      appWindow = getCurrentWindow();
    } catch (e) {
      console.warn('[WINDOW] Running outside of Tauri environment - skipping state management');
      return;
    }

    if (!appWindow) return;

    const restoreState = async () => {
      try {
        const state = await store.get<{ width: number; height: number; x: number; y: number }>('window-state');
        if (state) {
          // Future: Implement window sizing logic
        }
      } catch (e) {
        console.warn('[WINDOW] Failed to restore state:', e);
      }
    };

    const saveState = async () => {
      try {
        const size = await appWindow.innerSize();
        const position = await appWindow.outerPosition();
        await store.set('window-state', {
          width: size.width,
          height: size.height,
          x: position.x,
          y: position.y,
        });
        await store.save();
      } catch (e) {
         // Silently fail if window metadata is unavailable
      }
    };

    restoreState();

    // Listen for resize/move and save
    let unlistenResize: any;
    let unlistenMove: any;

    try {
       unlistenResize = appWindow.onResized(saveState);
       unlistenMove = appWindow.onMoved(saveState);
    } catch (e) {
       return;
    }

    return () => {
      if (unlistenResize) unlistenResize.then((f: any) => f?.());
      if (unlistenMove) unlistenMove.then((f: any) => f?.());
    };
  }, []);
}
