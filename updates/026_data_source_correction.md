# Session Summary: Data Source Correction & State Synchronization

## Summary of Work
- **Service Re-wiring (Phase 22)**:
    - **Endpoint Redirection**: Investigated and discovered that the `transfer/info` endpoint lacks speed-mode state.
    - **MainData Integration**: Switched the `getTransferInfo` method to utilize `sync/maindata?rid=0`, which provides the authentic `server_state` from qBittorrent.
    - **Field Mapping**: Mapped `use_alt_speed_limits` from the server response to the UI state.
- **Verification**:
    - **State Continuity**: Ensured that the speed limit mode is correctly detected upon application launch.
    - **Toggle Feedback**: Confirmed that the Rabbit/Turtle icons now switch reliably based on actual server-side responses.

## Impact
This change resolves the core "ghosting" issue where the UI remained stuck on Full Speed. ArrDeck now has a direct, accurate link to qBittorrent's speed management system, providing a high-fidelity control experience that mirrors the official client.
