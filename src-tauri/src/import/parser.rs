//! Parser Traits and Common Types
//!
//! Defines the common interface for all file parsers and shared data structures.

use serde::{Deserialize, Serialize};
use std::path::Path;
use thiserror::Error;

/// Errors that can occur during import operations
#[derive(Debug, Error, Serialize, Deserialize)]
pub enum ImportError {
    #[error("File not found: {0}")]
    FileNotFound(String),

    #[error("Failed to read file: {0}")]
    ReadError(String),

    #[error("Failed to parse file: {0}")]
    ParseError(String),

    #[error("Unsupported file format: {0}")]
    UnsupportedFormat(String),

    #[error("No data found in file")]
    EmptyFile,

    #[error("Password protected file")]
    PasswordProtected,

    #[error("Validation error: {0}")]
    ValidationError(String),
}

/// Represents a parsed file ready for column mapping
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedFile {
    /// Original filename
    pub file_name: String,
    /// Detected file type
    pub file_type: FileType,
    /// Header row (if detected)
    pub headers: Vec<String>,
    /// Data rows (raw cell values as strings)
    pub rows: Vec<ParsedRow>,
    /// Total row count (may differ from rows.len() if truncated)
    pub total_rows: usize,
    /// Whether the file was truncated due to size limits
    pub truncated: bool,
}

/// Supported file types
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum FileType {
    Xlsx,
    Csv,
    Pdf,
}

/// A single parsed row of data
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedRow {
    /// Original row number in the source file (1-indexed)
    pub row_number: usize,
    /// Cell values as strings
    pub cells: Vec<String>,
}

/// Column mapping from source to equipment field
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ColumnMapping {
    /// Index of the source column
    pub source_column: usize,
    /// Original header name from source
    pub source_header: String,
    /// Target equipment field (null if unmapped)
    pub target_field: Option<EquipmentField>,
}

/// Equipment fields that can be mapped
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum EquipmentField {
    Manufacturer,
    Model,
    Sku,
    Category,
    Subcategory,
    Description,
    Cost,
    Msrp,
    Height,
    Width,
    Depth,
    Weight,
    Voltage,
    Wattage,
    Certifications,
    ImageUrl,
}

/// Suggested mapping for a header
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HeaderSuggestion {
    /// Column index
    pub column_index: usize,
    /// Original header text
    pub header: String,
    /// Suggested equipment field
    pub suggested_field: Option<EquipmentField>,
    /// Confidence score (0.0 - 1.0)
    pub confidence: f32,
}

/// Validation result for a single row
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ValidationResult {
    /// Row number from source
    pub row_number: usize,
    /// Validation status
    pub status: ValidationStatus,
    /// Match type if updating existing equipment
    pub match_type: Option<MatchType>,
    /// ID of existing equipment if matched
    pub existing_equipment_id: Option<String>,
    /// Fields that are missing but required
    pub missing_fields: Vec<EquipmentField>,
    /// Error messages
    pub errors: Vec<String>,
}

/// Validation status for a row
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ValidationStatus {
    Valid,
    Incomplete,
    Invalid,
}

/// How an existing equipment record was matched
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum MatchType {
    New,
    UpdateSku,
    UpdateFallback,
}

/// Trait for file parsers
pub trait Parser {
    fn parse(path: &Path) -> Result<ParsedFile, ImportError>;
}

/// Maximum rows to load into memory
pub const MAX_ROWS: usize = 10_000;

/// Rows to show in preview
pub const PREVIEW_ROWS: usize = 100;

/// Detect header mappings based on common patterns
pub fn detect_header_mappings(parsed: &ParsedFile) -> Result<Vec<HeaderSuggestion>, ImportError> {
    let suggestions: Vec<HeaderSuggestion> = parsed
        .headers
        .iter()
        .enumerate()
        .map(|(idx, header)| {
            let (field, confidence) = suggest_field_for_header(header);
            HeaderSuggestion {
                column_index: idx,
                header: header.clone(),
                suggested_field: field,
                confidence,
            }
        })
        .collect();

    Ok(suggestions)
}

/// Suggest equipment field based on header name
fn suggest_field_for_header(header: &str) -> (Option<EquipmentField>, f32) {
    let lower = header.to_lowercase();
    let lower = lower.trim();

    // Exact or near-exact matches (high confidence)
    let high_confidence_mappings = [
        (
            &["manufacturer", "mfg", "brand", "vendor"][..],
            EquipmentField::Manufacturer,
        ),
        (
            &["model", "model number", "model #", "model no"][..],
            EquipmentField::Model,
        ),
        (
            &["sku", "part number", "part #", "part no", "item number", "item #", "pn"][..],
            EquipmentField::Sku,
        ),
        (&["category", "cat"][..], EquipmentField::Category),
        (
            &["subcategory", "sub-category", "subcat"][..],
            EquipmentField::Subcategory,
        ),
        (
            &["description", "desc", "product description", "item description"][..],
            EquipmentField::Description,
        ),
        (
            &["cost", "unit cost", "dealer cost", "net cost", "buy price"][..],
            EquipmentField::Cost,
        ),
        (
            &["msrp", "list price", "retail", "list", "srp"][..],
            EquipmentField::Msrp,
        ),
        (
            &["height", "h", "height (in)", "height (inches)"][..],
            EquipmentField::Height,
        ),
        (
            &["width", "w", "width (in)", "width (inches)"][..],
            EquipmentField::Width,
        ),
        (
            &["depth", "d", "depth (in)", "depth (inches)", "length"][..],
            EquipmentField::Depth,
        ),
        (
            &["weight", "wt", "weight (lbs)", "weight (lb)"][..],
            EquipmentField::Weight,
        ),
        (&["voltage", "volt", "v"][..], EquipmentField::Voltage),
        (
            &["wattage", "watts", "power", "w"][..],
            EquipmentField::Wattage,
        ),
        (
            &["certifications", "certs", "platform", "platforms"][..],
            EquipmentField::Certifications,
        ),
        (
            &["image", "image url", "imageurl", "picture", "photo"][..],
            EquipmentField::ImageUrl,
        ),
    ];

    for (patterns, field) in high_confidence_mappings.iter() {
        for pattern in *patterns {
            if lower == *pattern {
                return (Some(*field), 0.95);
            }
        }
    }

    // Partial matches (medium confidence)
    if lower.contains("manufacturer") || lower.contains("mfg") || lower.contains("brand") {
        return (Some(EquipmentField::Manufacturer), 0.7);
    }
    if lower.contains("model") {
        return (Some(EquipmentField::Model), 0.7);
    }
    if lower.contains("sku") || lower.contains("part") || lower.contains("item") {
        return (Some(EquipmentField::Sku), 0.7);
    }
    if lower.contains("cost") || lower.contains("price") {
        // Could be cost or msrp - lower confidence
        if lower.contains("list") || lower.contains("msrp") || lower.contains("retail") {
            return (Some(EquipmentField::Msrp), 0.6);
        }
        return (Some(EquipmentField::Cost), 0.6);
    }
    if lower.contains("desc") {
        return (Some(EquipmentField::Description), 0.7);
    }

    // No match
    (None, 0.0)
}

/// Validate rows against mappings
pub fn validate_rows(
    rows: &[ParsedRow],
    mappings: &[ColumnMapping],
) -> Result<Vec<ValidationResult>, ImportError> {
    let results: Vec<ValidationResult> = rows
        .iter()
        .map(|row| validate_single_row(row, mappings))
        .collect();

    Ok(results)
}

/// Validate a single row
fn validate_single_row(row: &ParsedRow, mappings: &[ColumnMapping]) -> ValidationResult {
    let mut missing_fields = Vec::new();
    let mut errors = Vec::new();

    // Required fields
    let required = [
        EquipmentField::Manufacturer,
        EquipmentField::Model,
        EquipmentField::Sku,
        EquipmentField::Cost,
    ];

    for field in required.iter() {
        let has_value = mappings.iter().any(|m| {
            if m.target_field == Some(*field) {
                row.cells
                    .get(m.source_column)
                    .map(|v| !v.trim().is_empty())
                    .unwrap_or(false)
            } else {
                false
            }
        });

        if !has_value {
            missing_fields.push(*field);
        }
    }

    // Validate cost is numeric
    if let Some(cost_mapping) = mappings.iter().find(|m| m.target_field == Some(EquipmentField::Cost)) {
        if let Some(cost_str) = row.cells.get(cost_mapping.source_column) {
            let cleaned = cost_str.replace(['$', ',', ' '], "");
            if !cleaned.is_empty() && cleaned.parse::<f64>().is_err() {
                errors.push(format!("Invalid cost format: '{}'", cost_str));
            }
        }
    }

    // Validate MSRP is numeric if present
    if let Some(msrp_mapping) = mappings.iter().find(|m| m.target_field == Some(EquipmentField::Msrp)) {
        if let Some(msrp_str) = row.cells.get(msrp_mapping.source_column) {
            let cleaned = msrp_str.replace(['$', ',', ' '], "");
            if !cleaned.is_empty() && cleaned.parse::<f64>().is_err() {
                errors.push(format!("Invalid MSRP format: '{}'", msrp_str));
            }
        }
    }

    // Determine status
    let status = if !errors.is_empty() {
        ValidationStatus::Invalid
    } else if !missing_fields.is_empty() {
        ValidationStatus::Incomplete
    } else {
        ValidationStatus::Valid
    };

    ValidationResult {
        row_number: row.row_number,
        status,
        match_type: Some(MatchType::New), // Will be updated when we check against DB
        existing_equipment_id: None,
        missing_fields,
        errors,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_suggest_field_manufacturer() {
        let (field, confidence) = suggest_field_for_header("Manufacturer");
        assert_eq!(field, Some(EquipmentField::Manufacturer));
        assert!(confidence > 0.9);
    }

    #[test]
    fn test_suggest_field_mfg() {
        let (field, confidence) = suggest_field_for_header("MFG");
        assert_eq!(field, Some(EquipmentField::Manufacturer));
        assert!(confidence > 0.9);
    }

    #[test]
    fn test_suggest_field_sku() {
        let (field, confidence) = suggest_field_for_header("Part Number");
        assert_eq!(field, Some(EquipmentField::Sku));
        assert!(confidence > 0.9);
    }

    #[test]
    fn test_suggest_field_cost_partial() {
        let (field, confidence) = suggest_field_for_header("Dealer Cost USD");
        assert_eq!(field, Some(EquipmentField::Cost));
        assert!(confidence >= 0.6);
    }

    #[test]
    fn test_suggest_field_unknown() {
        let (field, confidence) = suggest_field_for_header("Random Column");
        assert_eq!(field, None);
        assert_eq!(confidence, 0.0);
    }

    #[test]
    fn test_validate_row_complete() {
        let row = ParsedRow {
            row_number: 1,
            cells: vec![
                "Poly".to_string(),
                "Studio X50".to_string(),
                "2200-86260-001".to_string(),
                "2500.00".to_string(),
            ],
        };

        let mappings = vec![
            ColumnMapping {
                source_column: 0,
                source_header: "Manufacturer".to_string(),
                target_field: Some(EquipmentField::Manufacturer),
            },
            ColumnMapping {
                source_column: 1,
                source_header: "Model".to_string(),
                target_field: Some(EquipmentField::Model),
            },
            ColumnMapping {
                source_column: 2,
                source_header: "SKU".to_string(),
                target_field: Some(EquipmentField::Sku),
            },
            ColumnMapping {
                source_column: 3,
                source_header: "Cost".to_string(),
                target_field: Some(EquipmentField::Cost),
            },
        ];

        let result = validate_single_row(&row, &mappings);
        assert_eq!(result.status, ValidationStatus::Valid);
        assert!(result.missing_fields.is_empty());
        assert!(result.errors.is_empty());
    }

    #[test]
    fn test_validate_row_missing_sku() {
        let row = ParsedRow {
            row_number: 1,
            cells: vec![
                "Poly".to_string(),
                "Studio X50".to_string(),
                "".to_string(),
                "2500.00".to_string(),
            ],
        };

        let mappings = vec![
            ColumnMapping {
                source_column: 0,
                source_header: "Manufacturer".to_string(),
                target_field: Some(EquipmentField::Manufacturer),
            },
            ColumnMapping {
                source_column: 1,
                source_header: "Model".to_string(),
                target_field: Some(EquipmentField::Model),
            },
            ColumnMapping {
                source_column: 2,
                source_header: "SKU".to_string(),
                target_field: Some(EquipmentField::Sku),
            },
            ColumnMapping {
                source_column: 3,
                source_header: "Cost".to_string(),
                target_field: Some(EquipmentField::Cost),
            },
        ];

        let result = validate_single_row(&row, &mappings);
        assert_eq!(result.status, ValidationStatus::Incomplete);
        assert!(result.missing_fields.contains(&EquipmentField::Sku));
    }

    #[test]
    fn test_validate_row_invalid_cost() {
        let row = ParsedRow {
            row_number: 1,
            cells: vec![
                "Poly".to_string(),
                "Studio X50".to_string(),
                "ABC123".to_string(),
                "TBD".to_string(),
            ],
        };

        let mappings = vec![
            ColumnMapping {
                source_column: 0,
                source_header: "Manufacturer".to_string(),
                target_field: Some(EquipmentField::Manufacturer),
            },
            ColumnMapping {
                source_column: 1,
                source_header: "Model".to_string(),
                target_field: Some(EquipmentField::Model),
            },
            ColumnMapping {
                source_column: 2,
                source_header: "SKU".to_string(),
                target_field: Some(EquipmentField::Sku),
            },
            ColumnMapping {
                source_column: 3,
                source_header: "Cost".to_string(),
                target_field: Some(EquipmentField::Cost),
            },
        ];

        let result = validate_single_row(&row, &mappings);
        assert_eq!(result.status, ValidationStatus::Invalid);
        assert!(result.errors[0].contains("Invalid cost"));
    }
}
