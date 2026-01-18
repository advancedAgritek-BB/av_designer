//! AV Designer - Tauri Backend Library
//!
//! This module provides the Rust backend for the AV Designer desktop application.

pub mod commands;
pub mod database;
pub mod drawings;
pub mod export;

use commands::{get_app_info, greet};
use drawings::generate_electrical;
use export::export_to_pdf;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            get_app_info,
            generate_electrical,
            export_to_pdf
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
