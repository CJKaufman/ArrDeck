// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;
use tauri::WebviewUrl;
use tauri::WebviewWindowBuilder;
use tauri_plugin_window_state::StateFlags;

// Win32 API declarations — no extra crate needed, user32 is always linked on Windows
#[cfg(target_os = "windows")]
mod win32 {
    #[link(name = "user32")]
    extern "system" {
        pub fn GetWindowLongPtrW(hwnd: isize, index: i32) -> isize;
        pub fn SetWindowLongPtrW(hwnd: isize, index: i32, value: isize) -> isize;
        pub fn SetWindowPos(
            hwnd: isize,
            hwnd_insert_after: isize,
            x: i32,
            y: i32,
            cx: i32,
            cy: i32,
            flags: u32,
        ) -> i32;
    }

    pub const GWL_STYLE: i32 = -16;
    pub const WS_CAPTION: isize = 0x00C00000;
    pub const WS_THICKFRAME: isize = 0x00040000;
    // SetWindowPos flags
    pub const SWP_FRAMECHANGED: u32 = 0x0020;
    pub const SWP_NOMOVE: u32 = 0x0002;
    pub const SWP_NOSIZE: u32 = 0x0001;
    pub const SWP_NOZORDER: u32 = 0x0004;
    pub const SWP_NOACTIVATE: u32 = 0x0010;
}

/// Strips WS_CAPTION (title bar) from the Win32 window style and forces a frame
/// recalculation. This is more direct than Tauri's set_decorations() and cannot
/// be overridden by the window-state plugin.
#[cfg(target_os = "windows")]
unsafe fn strip_title_bar(hwnd: isize) {
    use win32::*;
    let style = GetWindowLongPtrW(hwnd, GWL_STYLE);
    SetWindowLongPtrW(hwnd, GWL_STYLE, style & !(WS_CAPTION | WS_THICKFRAME));
    SetWindowPos(
        hwnd,
        0,
        0,
        0,
        0,
        0,
        SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE,
    );
}
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

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
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            let window =
                WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                    .title("ArrDeck")
                    .inner_size(1280.0, 800.0)
                    .min_inner_size(800.0, 500.0)
                    .decorations(false)
                    .build()?;

            // Belt-and-suspenders: directly strip WS_CAPTION via Win32 so that
            // nothing (including the window-state plugin) can restore the title bar.
            #[cfg(target_os = "windows")]
            {
                use raw_window_handle::{HasWindowHandle, RawWindowHandle};
                if let Ok(handle) = window.window_handle() {
                    if let RawWindowHandle::Win32(h) = handle.as_raw() {
                        unsafe { strip_title_bar(h.hwnd.get() as isize) };
                    }
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
