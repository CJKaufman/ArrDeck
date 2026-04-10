# Update 011 — qBittorrent Module Integrated

**Date:** 2026-04-08
**Phase:** Phase 11
**Type:** Architecture | API Integration | Scope Change
**Affects:** `ARRDECK_PROJECTV2.md`, `package.json`

## Summary
The qBittorrent "Drop-In" module has been successfully integrated into the core project documentation. This formally adds qBittorrent as the primary download client manager for ArrDeck.

## Changes Made
- Merged all specifications from `ARRDECK_QBITTORRENT_DROPIN.md` into `ARRDECK_PROJECTV2.md`.
- Added new dependencies: `axios-cookiejar-support`, `tough-cookie`, `pretty-bytes`.
- Defined a new `qbittorrent` sub-folder in `src/components/`.
- Extended the global state to include qBittorrent credentials and session status.
- Added a new **Phase 11 — qBittorrent Integration** to the roadmap.
- Renumbered the **GitHub Release** phase to Phase 12.
- Updated Error Handling and Quick Reference tables with qBittorrent specifics.

## Deviations From Project Doc
- **Scope Change:** Download client management (previously out of scope) is now a core feature of the MVP via Phase 11.
- **Renumbering:** Phase 10 (Release) is now Phase 12.

## AI Instructions
> Follow Phase 11 instructions in `ARRDECK_PROJECTV2.md` to implement the qBittorrent module. Note that qBittorrent uses cookie-based auth, requiring special Axios configuration with `withCredentials: true` and a cookie jar.
