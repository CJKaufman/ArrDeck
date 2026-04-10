# Session Summary: Contrast & Queue Visibility Fixes

## Summary of Work
- **Data Integrity (Phase 16)**:
    - **Queue Title Fallback**: Implemented a fallback mechanism in `sonarrService` and `radarrService` to use `item.title` (release name) if the associated series/movie object is null.
    - **Unified Queue Fix**: Verified the `QueuePage` now correctly renders identifying titles for all active downloads.
- **Accessibility & Contrast**:
    - **Search Detail Boost**: Increased text opacities in `ReleaseSearchDialog` to ensure metadata (Size, Peer count, Indexer) is legible against dark backgrounds.
    - **Rejection Visibility**: Enhanced the styling of rejection reason badges for better technical triage.
    - **Cinematic Depth**: Added `drop-shadow` and glow effects to critical UI text to maintain readability across dynamic blurred backdrops.

## Impact
Users can now accurately monitor their download queue without encountering "Unknown" labels. Additionally, the interactive search process is significantly more accessible, allowing for faster evaluation of release metadata and rejection reasons.
