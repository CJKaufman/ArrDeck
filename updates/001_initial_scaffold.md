# Phase 1: Project Scaffold Complete

## Modifications Made
- Installed missing backend UI packages via `npm install` and configured Vite & TypeScript paths mapping (`@/*`).
- Completed `npx shadcn@latest init` to apply shadcn configuration with the `-c zinc` default and `tailwindcss` logic.
- Rewrote `src/index.css` by appending design variables to shadcn output and retaining standard Tailwind v4 format.
- Modified `index.html` to inject the `dark` class automatically, following the design system preference.
- Updated `src/main.tsx` to read `index.css` global styles.
- Updated `src/App.tsx` applying `react-router-dom` configuration with layouts and placeholders.

## Added Files
- **`src/components/layout/AppShell.tsx`**: Defines main container window frame wrapping `react-router-dom` `Outlet` and integrating the left navigation sidebar.
- **`src/components/layout/Sidebar.tsx`**: A `w-64` dark sidebar setup containing active links directly routed to dashboard, settings, queue, and service modules. Follows the provided lucide set (`Tv`, `Film`, `Link`).
- **`src/pages/DashboardPage.tsx`**: Route placeholder pointing to `/` rendering system info stub.
- **`src/pages/SonarrPage.tsx`**: Route placeholder pointing to `/sonarr`.
- **`src/pages/RadarrPage.tsx`**: Route placeholder pointing to `/radarr`.
- **`src/pages/ProwlarrPage.tsx`**: Route placeholder pointing to `/prowlarr`.
- **`src/pages/QueuePage.tsx`**: Route placeholder pointing to `/queue`.
- **`src/pages/SearchPage.tsx`**: Route placeholder pointing to `/search`.
- **`src/pages/SettingsPage.tsx`**: Route placeholder pointing to `/settings`.

## Next Steps
Following `ARRDECK_PROJECTV2.md`, Phase 2 is **Settings & Connection**, initializing the `settings.store.ts` Zustand instance, preparing `tauri-plugin-store` and `api-client.ts`.
