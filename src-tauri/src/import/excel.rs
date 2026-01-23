//! Excel Parser
//!
//! Parses .xlsx and .xls files using the calamine crate.

use super::parser::{FileType, ImportError, ParsedFile, ParsedRow, Parser, MAX_ROWS};
use calamine::{open_workbook_auto, Data, Reader};
use std::path::Path;

/// Excel file parser
pub struct ExcelParser;

impl Parser for ExcelParser {
    fn parse(path: &Path) -> Result<ParsedFile, ImportError> {
        let file_name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown.xlsx")
            .to_string();

        // Open workbook
        let mut workbook = open_workbook_auto(path).map_err(|e| {
            let msg = e.to_string();
            if msg.contains("password") || msg.contains("encrypted") {
                ImportError::PasswordProtected
            } else if msg.contains("not found") || msg.contains("No such file") {
                ImportError::FileNotFound(path.display().to_string())
            } else {
                ImportError::ReadError(msg)
            }
        })?;

        // Get first sheet
        let sheet_names = workbook.sheet_names().to_vec();
        if sheet_names.is_empty() {
            return Err(ImportError::EmptyFile);
        }

        let first_sheet = &sheet_names[0];
        let range = workbook
            .worksheet_range(first_sheet)
            .map_err(|e| ImportError::ParseError(e.to_string()))?;

        if range.is_empty() {
            return Err(ImportError::EmptyFile);
        }

        let total_rows = range.height();

        // Extract headers from first row
        let headers: Vec<String> = range
            .rows()
            .next()
            .map(|row| row.iter().map(cell_to_string).collect())
            .unwrap_or_default();

        if headers.is_empty() {
            return Err(ImportError::EmptyFile);
        }

        // Extract data rows (skip header)
        let rows: Vec<ParsedRow> = range
            .rows()
            .skip(1)
            .take(MAX_ROWS)
            .enumerate()
            .filter_map(|(idx, row)| {
                let cells: Vec<String> = row.iter().map(cell_to_string).collect();
                // Skip completely empty rows
                if cells.iter().all(|c| c.trim().is_empty()) {
                    None
                } else {
                    Some(ParsedRow {
                        row_number: idx + 2, // 1-indexed, skip header
                        cells,
                    })
                }
            })
            .collect();

        if rows.is_empty() {
            return Err(ImportError::EmptyFile);
        }

        Ok(ParsedFile {
            file_name,
            file_type: FileType::Xlsx,
            headers,
            rows,
            total_rows,
            truncated: total_rows > MAX_ROWS + 1, // +1 for header
        })
    }
}

/// Convert a cell to string representation
fn cell_to_string(cell: &Data) -> String {
    match cell {
        Data::Empty => String::new(),
        Data::String(s) | Data::DateTimeIso(s) | Data::DurationIso(s) => s.clone(),
        Data::Float(f) => {
            // Format floats nicely (avoid scientific notation for prices)
            if f.fract() == 0.0 {
                format!("{:.0}", f)
            } else {
                format!("{:.2}", f)
            }
        }
        Data::Int(i) => i.to_string(),
        Data::Bool(b) => b.to_string(),
        Data::DateTime(dt) => format!("{:.0}", dt),
        Data::Error(e) => format!("ERROR: {:?}", e),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use calamine::Data;

    #[test]
    fn test_cell_to_string_empty() {
        assert_eq!(cell_to_string(&Data::Empty), "");
    }

    #[test]
    fn test_cell_to_string_string() {
        assert_eq!(cell_to_string(&Data::String("Hello".to_string())), "Hello");
    }

    #[test]
    fn test_cell_to_string_int() {
        assert_eq!(cell_to_string(&Data::Int(42)), "42");
    }

    #[test]
    fn test_cell_to_string_float_whole() {
        assert_eq!(cell_to_string(&Data::Float(100.0)), "100");
    }

    #[test]
    fn test_cell_to_string_float_decimal() {
        assert_eq!(cell_to_string(&Data::Float(99.99)), "99.99");
    }

    #[test]
    fn test_cell_to_string_bool() {
        assert_eq!(cell_to_string(&Data::Bool(true)), "true");
    }

    #[test]
    fn test_parse_nonexistent_file() {
        let result = ExcelParser::parse(Path::new("/nonexistent/file.xlsx"));
        assert!(matches!(result, Err(ImportError::FileNotFound(_)) | Err(ImportError::ReadError(_))));
    }
}
