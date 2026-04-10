import { useSettingsStore } from '../stores/settings.store';
import { useEffect } from 'react';
import { load } from '@tauri-apps/plugin-store';

// We fallback to local storage if Tauri is not available (e.g. running purely in browser)
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;

let tauriStore: any = null;

export function useSettings() {
  const store = useSettingsStore();

  useEffect(() => {
    if (!isTauri) return;

    let unsubscribe: (() => void) | null = null;
    
    // Load config from Tauri store on mount
    load('arrdeck-settings.json').then((storeInstance) => {
      tauriStore = storeInstance;
      return tauriStore.get('arrdeck-settings');
    }).then((val: any) => {
      if (val) {
        // Hydrate zustand from tauri store
        useSettingsStore.setState(val);
      }
      
      // Subscribe to Zustand changes and save to Tauri store
      unsubscribe = useSettingsStore.subscribe((state) => {
        tauriStore?.set('arrdeck-settings', state)
          .then(() => tauriStore?.save())
          .catch(console.error);
      });
    }).catch(console.error);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return store;
}
