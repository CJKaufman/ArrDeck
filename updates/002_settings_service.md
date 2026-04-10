# Phase 2: Settings & Connection Complete

## Modifications Made
- Installed new shadcn/ui components (`input`, `label`, `select`, `card`, `switch`, `sonner` for toasts, `tabs`).
- Established `useSettingsStore` inside Zustand mapping default ports correctly.
- Created `useSettings` hook with automated syncing from `__TAURI_INTERNALS__` Store backend (`settings.json`).
- Updated `AppShell.tsx` enforcing proper `ThemeProvider` context injecting `<html class="dark | light">` with `sonner` Toaster globally available.

## Added Files
- **`src/stores/settings.store.ts`**: Implements global states, managing the logic of all services endpoints and theme context, utilizing Zustand middleware for standard properties.
- **`src/hooks/useSettings.ts`**: Provides the functional hook wrapping `@tauri-apps/plugin-store` and `useSettingsStore` to securely persist state changes when the application lives in an OS window shell. Fallbacks gracefully to non-Tauri mode during web vite dev previews.
- **`src/services/api-client.ts`**: Implements the base `axios` connection mapping standard API keys using `X-Api-Key` HTTP headers for all requests.
- **`src/pages/SettingsPage.tsx`**: Constructed a fully flushed out tabbed view configuring Sonarr, Radarr, and Prowlarr. Wires connection test execution directly pointing to `/api/vX/system/status` using the local node backend. Uses `.border-sonarr/50` styling logic applying aesthetic visual cues matching main project tokens.

## Next Steps
Now rolling forward to Phase 3: Dashboard. The Dashboard should use polling intervals configured in settings to read metrics from connected indexers using TanStack query polling.
