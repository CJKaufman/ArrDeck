// ArrDeck — Tauri backend
// Uses DWM (Desktop Window Manager) to colour the native Windows title bar
// instead of trying to remove it, which is unreliable across WebView2 versions.

use tauri::Manager;
use tauri_plugin_window_state::StateFlags;

// ─── Win32 / DWM bindings ────────────────────────────────────────────────────

#[cfg(target_os = "windows")]
mod win32 {
    #[link(name = "user32")]
    extern "system" {
        /// Walk up the window hierarchy to the root (top-level) ancestor.
        /// WebView2 often gives us a child HWND — we need the frame window.
        pub fn GetAncestor(hwnd: isize, flags: u32) -> isize;
    }
    pub const GA_ROOT: u32 = 2;
}

#[cfg(target_os = "windows")]
mod dwm {
    #[link(name = "dwmapi")]
    extern "system" {
        pub fn DwmSetWindowAttribute(
            hwnd: isize,
            dw_attribute: u32,
            pv_attribute: *const core::ffi::c_void,
            cb_attribute: u32,
        ) -> i32;
    }
    // Windows 11 Build 22000+ DWM attributes
    pub const DWMWA_BORDER_COLOR: u32 = 34;
    pub const DWMWA_CAPTION_COLOR: u32 = 35;
    pub const DWMWA_TEXT_COLOR: u32 = 36;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/// Convert separate R/G/B bytes into a Win32 COLORREF (0x00BBGGRR).
#[cfg(target_os = "windows")]
fn to_colorref(r: u8, g: u8, b: u8) -> u32 {
    (r as u32) | ((g as u32) << 8) | ((b as u32) << 16)
}

/// Apply DWM caption / border / text colours to the root frame window.
/// We always call GetAncestor because WebView2 may hand us a child HWND.
#[cfg(target_os = "windows")]
unsafe fn apply_dwm_colors(child_hwnd: isize, bg_colorref: u32, text_colorref: u32) {
    use dwm::*;
    use win32::*;

    let hwnd = {
        let root = GetAncestor(child_hwnd, GA_ROOT);
        if root != 0 {
            root
        } else {
            child_hwnd
        }
    };

    DwmSetWindowAttribute(
        hwnd,
        DWMWA_CAPTION_COLOR,
        &bg_colorref as *const u32 as *const core::ffi::c_void,
        4,
    );
    DwmSetWindowAttribute(
        hwnd,
        DWMWA_TEXT_COLOR,
        &text_colorref as *const u32 as *const core::ffi::c_void,
        4,
    );
    DwmSetWindowAttribute(
        hwnd,
        DWMWA_BORDER_COLOR,
        &bg_colorref as *const u32 as *const core::ffi::c_void,
        4,
    );
}

/// Obtain the raw HWND from a Tauri WebviewWindow via raw-window-handle.
#[cfg(target_os = "windows")]
fn hwnd_from_window(window: &tauri::WebviewWindow) -> Option<isize> {
    use raw_window_handle::{HasWindowHandle, RawWindowHandle};
    if let Ok(handle) = window.window_handle() {
        if let RawWindowHandle::Win32(h) = handle.as_raw() {
            return Some(h.hwnd.get() as isize);
        }
    }
    None
}

// ─── Tauri commands ──────────────────────────────────────────────────────────

/// Called from JavaScript whenever the theme changes.
/// r/g/b is the sidebar background colour for the new theme.
/// light_text = false → use dark text (for light themes like Ghost).
#[tauri::command]
fn set_title_bar_color(window: tauri::WebviewWindow, r: u8, g: u8, b: u8, light_text: bool) {
    #[cfg(target_os = "windows")]
    {
        if let Some(hwnd) = hwnd_from_window(&window) {
            let bg = to_colorref(r, g, b);
            let text: u32 = if light_text {
                // dark text for light themes
                to_colorref(0x1e, 0x29, 0x3b)
            } else {
                // white text for dark themes
                0x00FF_FFFF
            };
            unsafe { apply_dwm_colors(hwnd, bg, text) };
        }
    }
    // No-op on non-Windows
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// ─── App entry point ─────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_process::init())
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(StateFlags::SIZE | StateFlags::POSITION | StateFlags::MAXIMIZED)
                .build(),
        )
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![greet, set_title_bar_color])
        .setup(|app| {
            // Apply initial DWM title-bar colour (Matrix theme default: #090d13)
            // This runs after all plugins so it wins over any window-state restoration.
            #[cfg(target_os = "windows")]
            {
                if let Some(window) = app.get_webview_window("main") {
                    if let Some(hwnd) = hwnd_from_window(&window) {
                        // #090d13 → COLORREF 0x00130D09, white text
                        unsafe { apply_dwm_colors(hwnd, 0x0013_0D09, 0x00FF_FFFF) };
                    }
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
