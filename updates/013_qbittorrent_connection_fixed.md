# Update 013 — qBittorrent Connection Fix

**Date:** 2026-04-08
**Status:** Completed
**Type:** Bug Fix | Security Configuration

## Problem
qBittorrent connection was failing because the `Referer` and `Origin` headers were being stripped by the Tauri HTTP plugin (compliance with Fetch API "forbidden headers"). This triggered qBittorrent's CSRF protection, leading to an "Unknown error" (403 Forbidden).

## Changes Made
- **Cargo.toml**: Enabled the `unsafe-headers` feature for `tauri-plugin-http`. This allows the bridge to send standard-forbidden headers required by local service APIs.
- **QBittorrentService**:
    - Hard-coded `Referer` and `Origin` construction in all requests.
    - Improved error handling to catch and explain `401 Unauthorized` and `403 Forbidden` statuses.
    - Fixed TypeScript linting errors related to `FetchOptions` in Tauri v2.

## Verification Required
- A full restart of `npm run tauri dev` is required to recompile the Rust binary with the new feature flag.
- "Test Connection" in Settings should now succeed if credentials are correct.
