//! Database Module
//!
//! This module handles local SQLite database operations for offline caching
//! and sync with the Supabase cloud database.

use serde::{Deserialize, Serialize};

/// Connection status for the local database
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConnectionStatus {
    Connected,
    Disconnected,
    Syncing,
    Error(String),
}

/// Database configuration
#[derive(Debug, Clone)]
pub struct DatabaseConfig {
    pub path: String,
}

impl Default for DatabaseConfig {
    fn default() -> Self {
        Self {
            path: "av_designer.db".to_string(),
        }
    }
}

/// Placeholder for database manager
/// Will be expanded to handle SQLite operations
pub struct DatabaseManager {
    config: DatabaseConfig,
    status: ConnectionStatus,
}

impl DatabaseManager {
    /// Create a new database manager with default configuration
    pub fn new() -> Self {
        Self {
            config: DatabaseConfig::default(),
            status: ConnectionStatus::Disconnected,
        }
    }

    /// Create a new database manager with custom configuration
    pub fn with_config(config: DatabaseConfig) -> Self {
        Self {
            config,
            status: ConnectionStatus::Disconnected,
        }
    }

    /// Get the current connection status
    pub fn status(&self) -> &ConnectionStatus {
        &self.status
    }

    /// Get the database path
    pub fn path(&self) -> &str {
        &self.config.path
    }
}

impl Default for DatabaseManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_database_manager_new() {
        let manager = DatabaseManager::new();
        assert!(matches!(manager.status(), ConnectionStatus::Disconnected));
    }

    #[test]
    fn test_database_config_default() {
        let config = DatabaseConfig::default();
        assert_eq!(config.path, "av_designer.db");
    }
}
