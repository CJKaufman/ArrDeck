import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Update } from '@tauri-apps/plugin-updater';

export interface UpdaterState {
  isChecking: boolean;
  update: Update | null;
  isDownloading: boolean;
  downloadProgress: number;
  isInstalling: boolean;
  error: string | null;
  dismissed: boolean;
}

interface UpdaterContextType extends UpdaterState {
  installUpdate: () => Promise<void>;
  dismiss: () => void;
  manualCheck: () => Promise<void>;
}

const UpdaterContext = createContext<UpdaterContextType | null>(null);

export function UpdaterProvider({ children }: { children: ReactNode }) {
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
      // Dynamic import to avoid breaking browser/dev builds
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();
      setState(s => ({ ...s, isChecking: false, update: update ?? null }));
    } catch (err: any) {
      // Endpoint missing (404) or network error — swallow silently
      setState(s => ({ ...s, isChecking: false, error: null }));
    }
  }, []);

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
              setState(s => ({ ...s, downloadProgress: Math.round((downloaded / total) * 100) }));
            }
            break;
          case 'Finished':
            setState(s => ({ ...s, isDownloading: false, isInstalling: true }));
            break;
        }
      });
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
    } catch (err: any) {
      setState(s => ({ ...s, isDownloading: false, isInstalling: false, error: err?.message ?? 'Update failed' }));
    }
  }, [state.update]);

  const dismiss = useCallback(() => {
    setState(s => ({ ...s, dismissed: true }));
  }, []);

  const manualCheck = useCallback(async () => {
    setState(s => ({ ...s, dismissed: false, update: null }));
    await checkForUpdate();
  }, [checkForUpdate]);

  return (
    <UpdaterContext.Provider value={{ ...state, installUpdate, dismiss, manualCheck }}>
      {children}
    </UpdaterContext.Provider>
  );
}

export function useUpdater() {
  const ctx = useContext(UpdaterContext);
  if (!ctx) throw new Error('useUpdater must be used inside <UpdaterProvider>');
  return ctx;
}
