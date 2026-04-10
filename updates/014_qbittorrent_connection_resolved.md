# Update 014 — qBittorrent Connection Resolved

**Date:** 2026-04-08
**Status:** Completed
**Type:** Security | Configuration Fix

## Problem
The connection to qBittorrent was being blocked by Tauri's internal security system (Permissions/ACL). The specific error was `url not allowed on the configured scope`. This happened because the application window was not correctly mapped to the permission capability, and the permission identifier used for HTTP fetch was incorrect.

## Changes Made
- **tauri.conf.json**: Explicitly added the label `"main"` to the application window. This is required for Tauri 2 to match capabilities to windows.
- **capabilities/default.json**: 
    - Fixed the permission ID to `http:allow-fetch` (the correct identifier for the HTTP plugin's fetch command).
    - Broadened the URL scope to `http://*:*/**` and `https://*:*/**` to allow all local and external network traffic.
- **Cleanup**: Removed all temporary debug logging from `SettingsPage.tsx` and `qbittorrent.service.ts` once the connection was verified as successful.

## Outcome
The "Test Connection" button now succeeds, and ArrDeck can successfully authenticate and communicate with the qBittorrent Web API. 
