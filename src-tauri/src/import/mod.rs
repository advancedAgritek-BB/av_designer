//! Import Module
//!
//! Handles parsing of pricing sheets (Excel, CSV, PDF) for equipment import.
//! Provides Tauri commands for the frontend import wizard.

mod csv_parser;
mod excel;
mod parser;

pub use parser::{HeaderSuggestion, ImportError, ParsedFile, ParsedRow};

use crate::import::parser::Parser;
use std::path::Path;

/// Parse a file and return structured data
///
/// Automatically detects file type based on extension and uses appropriate parser.
#[tauri::command]
pub async fn parse_import_file(path: String) -> Result<ParsedFile, ImportError> {
    let path = Path::new(&path);

    let extension = path
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .unwrap_or_default();

    match extension.as_str() {
        "xlsx" | "xls" => excel::ExcelParser::parse(path),
        "csv" => csv_parser::CsvParser::parse(path),
        _ => Err(ImportError::UnsupportedFormat(format!(
            "Unsupported file format: .{}",
            extension
        ))),
    }
}

/// Detect header names and suggest field mappings
#[tauri::command]
pub async fn detect_headers(parsed: ParsedFile) -> Result<Vec<HeaderSuggestion>, ImportError> {
    parser::detect_header_mappings(&parsed)
}

/// Validate rows against equipment schema and check for existing matches
#[tauri::command]
pub async fn validate_import_rows(
    rows: Vec<ParsedRow>,
    mappings: Vec<parser::ColumnMapping>,
) -> Result<Vec<parser::ValidationResult>, ImportError> {
    parser::validate_rows(&rows, &mappings)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_unsupported_format() {
        let result = tokio_test::block_on(parse_import_file("/test/file.txt".to_string()));
        assert!(result.is_err());
        match result {
            Err(ImportError::UnsupportedFormat(msg)) => {
                assert!(msg.contains("txt"));
            }
            _ => panic!("Expected UnsupportedFormat error"),
        }
    }
}
