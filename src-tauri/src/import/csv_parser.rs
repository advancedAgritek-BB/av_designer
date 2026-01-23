//! CSV Parser
//!
//! Parses .csv files using the csv crate.

use super::parser::{FileType, ImportError, ParsedFile, ParsedRow, Parser, MAX_ROWS};
use csv::ReaderBuilder;
use std::fs::File;
use std::path::Path;

/// CSV file parser
pub struct CsvParser;

impl Parser for CsvParser {
    fn parse(path: &Path) -> Result<ParsedFile, ImportError> {
        let file_name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown.csv")
            .to_string();

        // Open file
        let file = File::open(path).map_err(|e| {
            if e.kind() == std::io::ErrorKind::NotFound {
                ImportError::FileNotFound(path.display().to_string())
            } else {
                ImportError::ReadError(e.to_string())
            }
        })?;

        // Create CSV reader with flexible settings
        let mut reader = ReaderBuilder::new()
            .flexible(true) // Allow varying number of fields
            .trim(csv::Trim::All)
            .from_reader(file);

        // Get headers
        let headers: Vec<String> = reader
            .headers()
            .map_err(|e| ImportError::ParseError(e.to_string()))?
            .iter()
            .map(|s| s.to_string())
            .collect();

        if headers.is_empty() {
            return Err(ImportError::EmptyFile);
        }

        // Count total rows (we need to iterate through to count)
        let file_for_count = File::open(path).map_err(|e| ImportError::ReadError(e.to_string()))?;
        let count_reader = ReaderBuilder::new()
            .flexible(true)
            .from_reader(file_for_count);
        let total_rows = count_reader.into_records().count() + 1; // +1 for header

        // Re-open for actual reading
        let file = File::open(path).map_err(|e| ImportError::ReadError(e.to_string()))?;
        let mut reader = ReaderBuilder::new()
            .flexible(true)
            .trim(csv::Trim::All)
            .from_reader(file);

        // Extract data rows
        let rows: Vec<ParsedRow> = reader
            .records()
            .take(MAX_ROWS)
            .enumerate()
            .filter_map(|(idx, result)| {
                match result {
                    Ok(record) => {
                        let cells: Vec<String> = record.iter().map(|s| s.to_string()).collect();
                        // Skip completely empty rows
                        if cells.iter().all(|c| c.trim().is_empty()) {
                            None
                        } else {
                            Some(ParsedRow {
                                row_number: idx + 2, // 1-indexed, skip header
                                cells,
                            })
                        }
                    }
                    Err(_) => None, // Skip malformed rows
                }
            })
            .collect();

        if rows.is_empty() {
            return Err(ImportError::EmptyFile);
        }

        Ok(ParsedFile {
            file_name,
            file_type: FileType::Csv,
            headers,
            rows,
            total_rows,
            truncated: total_rows > MAX_ROWS + 1, // +1 for header
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;

    fn create_test_csv(content: &str) -> NamedTempFile {
        let mut file = NamedTempFile::with_suffix(".csv").unwrap();
        file.write_all(content.as_bytes()).unwrap();
        file.flush().unwrap();
        file
    }

    #[test]
    fn test_parse_simple_csv() {
        let content = "Manufacturer,Model,SKU,Cost\nPoly,Studio X50,2200-86260-001,2500.00\n";
        let file = create_test_csv(content);

        let result = CsvParser::parse(file.path());
        assert!(result.is_ok());

        let parsed = result.unwrap();
        assert_eq!(parsed.headers.len(), 4);
        assert_eq!(parsed.headers[0], "Manufacturer");
        assert_eq!(parsed.rows.len(), 1);
        assert_eq!(parsed.rows[0].cells[0], "Poly");
        assert_eq!(parsed.rows[0].cells[3], "2500.00");
    }

    #[test]
    fn test_parse_csv_with_empty_rows() {
        let content = "Manufacturer,Model,SKU,Cost\nPoly,Studio X50,ABC123,100\n,,,\nCrestron,DMPS,XYZ789,200\n";
        let file = create_test_csv(content);

        let result = CsvParser::parse(file.path());
        assert!(result.is_ok());

        let parsed = result.unwrap();
        assert_eq!(parsed.rows.len(), 2); // Empty row skipped
    }

    #[test]
    fn test_parse_empty_csv() {
        let content = "";
        let file = create_test_csv(content);

        let result = CsvParser::parse(file.path());
        assert!(matches!(result, Err(ImportError::EmptyFile) | Err(ImportError::ParseError(_))));
    }

    #[test]
    fn test_parse_headers_only_csv() {
        let content = "Manufacturer,Model,SKU,Cost\n";
        let file = create_test_csv(content);

        let result = CsvParser::parse(file.path());
        assert!(matches!(result, Err(ImportError::EmptyFile)));
    }

    #[test]
    fn test_parse_nonexistent_file() {
        let result = CsvParser::parse(Path::new("/nonexistent/file.csv"));
        assert!(matches!(result, Err(ImportError::FileNotFound(_))));
    }

    #[test]
    fn test_parse_csv_with_varying_columns() {
        let content = "A,B,C\n1,2,3\n4,5\n6,7,8,9\n";
        let file = create_test_csv(content);

        let result = CsvParser::parse(file.path());
        assert!(result.is_ok());

        let parsed = result.unwrap();
        assert_eq!(parsed.rows.len(), 3);
        assert_eq!(parsed.rows[1].cells.len(), 2); // Row with fewer columns
    }
}
