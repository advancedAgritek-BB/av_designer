//! Tauri Commands Module
//!
//! This module contains all Tauri IPC commands for the AV Designer application.
//! Commands are organized by domain:
//! - Equipment: CRUD operations for equipment catalog
//! - Projects: Project management operations
//! - Drawings: Drawing generation and export
//! - Standards: Standards validation operations

use serde::{Deserialize, Serialize};

/// Application information returned by the greet command
#[derive(Debug, Serialize, Deserialize)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
}

/// A sample greeting command to verify IPC is working
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to AV Designer.", name)
}

/// Get application information
#[tauri::command]
pub fn get_app_info() -> AppInfo {
    AppInfo {
        name: "AV Designer".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet() {
        let result = greet("World");
        assert_eq!(result, "Hello, World! Welcome to AV Designer.");
    }

    #[test]
    fn test_app_info() {
        let info = get_app_info();
        assert_eq!(info.name, "AV Designer");
        assert!(!info.version.is_empty());
    }
}
