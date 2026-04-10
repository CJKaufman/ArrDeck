import { useState, useEffect, useCallback } from 'react';
import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export interface UpdaterState {
  isChecking: boolean;
  update: Update | null;
  isDownloading: boolean;
  downloadProgress: number; // 0-100
  isInstalling: boolean;
  error: string | null;
  dismissed: boolean;
}

export function useUpdater() {
  const [state, setState] = useState<UpdaterState>({
    isChecking: false,
    update: null,
    isDownloading: false,
    downloadProgress: 0,
    isInstalling: false,
    error: null,
    dismissed: false,
  });

  const checkForUpdate = useCallback(async () => {
    // Only run inside Tauri
    if (!('__TAURI_INTERNALS__' in window)) return;

    setState(s => ({ ...s, isChecking: true, error: null }));
    try {
      const update = await check();
      setState(s => ({ ...s, isChecking: false, update: update ?? null }));
    } catch (err: any) {
      // Silently swallow in dev — endpoint won't exist locally
      setState(s => ({ ...s, isChecking: false, error: null }));
    }
  }, []);

  // Check on mount (after a short delay so the app finishes loading)
  useEffect(() => {
    const timer = setTimeout(checkForUpdate, 3000);
    return () => clearTimeout(timer);
  }, [checkForUpdate]);

  const installUpdate = useCallback(async () => {
    if (!state.update) return;

    setState(s => ({ ...s, isDownloading: true, downloadProgress: 0 }));

    try {
      let downloaded = 0;
      let total = 0;

      await state.update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            total = event.data.contentLength ?? 0;
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            if (total > 0) {
              setState(s => ({
                ...s,
                downloadProgress: Math.round((downloaded / total) * 100),
              }));
            }
            break;
          case 'Finished':
            setState(s => ({ ...s, isDownloading: false, isInstalling: true }));
            break;
        }
      });

      await relaunch();
    } catch (err: any) {
      setState(s => ({
        ...s,
        isDownloading: false,
        isInstalling: false,
        error: err?.message ?? 'Update failed',
      }));
    }
  }, [state.update]);

  const dismiss = useCallback(() => {
    setState(s => ({ ...s, dismissed: true }));
  }, []);

  const manualCheck = useCallback(async () => {
    setState(s => ({ ...s, dismissed: false, update: null }));
    await checkForUpdate();
  }, [checkForUpdate]);

  return { ...state, installUpdate, dismiss, manualCheck };
}
