//! PDF Export Module
//!
//! Generates PDF documents from drawing data with configurable
//! title blocks and page layouts.

use serde::{Deserialize, Serialize};

// ============================================================================
// Page Size Constants
// ============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PageSize {
    Letter,
    Legal,
    Tabloid,
    A4,
    A3,
    ArchD,
}

impl PageSize {
    /// Returns dimensions in points (1/72 inch)
    pub fn dimensions(&self) -> (f64, f64) {
        match self {
            PageSize::Letter => (612.0, 792.0),   // 8.5" x 11"
            PageSize::Legal => (612.0, 1008.0),   // 8.5" x 14"
            PageSize::Tabloid => (792.0, 1224.0), // 11" x 17"
            PageSize::A4 => (595.0, 842.0),       // 210mm x 297mm
            PageSize::A3 => (842.0, 1191.0),      // 297mm x 420mm
            PageSize::ArchD => (1728.0, 2592.0),  // 24" x 36"
        }
    }
}

// ============================================================================
// Page Orientation
// ============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PageOrientation {
    Portrait,
    Landscape,
}

// ============================================================================
// Page Layout Configuration
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PageLayout {
    pub size: PageSize,
    pub orientation: PageOrientation,
    pub margin_top: f64,
    pub margin_bottom: f64,
    pub margin_left: f64,
    pub margin_right: f64,
}

impl Default for PageLayout {
    fn default() -> Self {
        Self {
            size: PageSize::Letter,
            orientation: PageOrientation::Landscape,
            margin_top: 36.0,    // 0.5"
            margin_bottom: 36.0, // 0.5"
            margin_left: 36.0,   // 0.5"
            margin_right: 36.0,  // 0.5"
        }
    }
}

impl PageLayout {
    /// Returns effective page dimensions accounting for orientation (in points)
    pub fn effective_dimensions(&self) -> (f64, f64) {
        let (w, h) = self.size.dimensions();
        match self.orientation {
            PageOrientation::Portrait => (w, h),
            PageOrientation::Landscape => (h, w),
        }
    }

    /// Returns drawable area after margins (in points)
    pub fn drawable_area(&self) -> (f64, f64) {
        let (w, h) = self.effective_dimensions();
        (
            w - self.margin_left - self.margin_right,
            h - self.margin_top - self.margin_bottom,
        )
    }
}

// ============================================================================
// Title Block Configuration
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TitleBlock {
    pub project_name: String,
    pub drawing_title: String,
    pub drawing_number: String,
    pub revision: String,
    pub date: String,
    pub drawn_by: String,
    pub checked_by: Option<String>,
    pub approved_by: Option<String>,
    pub scale: String,
    pub sheet_number: u32,
    pub total_sheets: u32,
}

impl TitleBlock {
    pub fn new(project_name: &str, drawing_title: &str) -> Self {
        Self {
            project_name: project_name.to_string(),
            drawing_title: drawing_title.to_string(),
            drawing_number: String::new(),
            revision: "A".to_string(),
            date: chrono::Utc::now().format("%Y-%m-%d").to_string(),
            drawn_by: String::new(),
            checked_by: None,
            approved_by: None,
            scale: "NTS".to_string(), // Not To Scale
            sheet_number: 1,
            total_sheets: 1,
        }
    }
}

// ============================================================================
// Drawing Input Types (from frontend)
// ============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ElementType {
    Equipment,
    Cable,
    Text,
    Dimension,
    Symbol,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LayerType {
    TitleBlock,
    Architectural,
    AvElements,
    Annotations,
    Dimensions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DrawingElement {
    pub id: String,
    #[serde(rename = "type")]
    pub element_type: ElementType,
    pub x: f64,
    pub y: f64,
    pub rotation: f64,
    pub properties: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DrawingLayer {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub layer_type: LayerType,
    pub is_locked: bool,
    pub is_visible: bool,
    pub elements: Vec<DrawingElement>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DrawingType {
    Electrical,
    Elevation,
    Rcp,
    Rack,
    CableSchedule,
    FloorPlan,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DrawingInput {
    pub id: String,
    pub room_id: String,
    #[serde(rename = "type")]
    pub drawing_type: DrawingType,
    pub layers: Vec<DrawingLayer>,
}

// ============================================================================
// PDF Export Configuration
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PdfExportConfig {
    pub page_layout: PageLayout,
    pub title_block: TitleBlock,
    pub include_layer_info: bool,
    pub include_timestamp: bool,
}

impl PdfExportConfig {
    pub fn new(title_block: TitleBlock) -> Self {
        Self {
            page_layout: PageLayout::default(),
            title_block,
            include_layer_info: true,
            include_timestamp: true,
        }
    }
}

// ============================================================================
// PDF Export Result
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PdfExportResult {
    pub file_path: String,
    pub file_size_bytes: u64,
    pub page_count: u32,
    pub generated_at: String,
}

// ============================================================================
// PDF Generator
// ============================================================================

/// Generates a PDF document from drawing data
///
/// Note: This is a structural implementation that creates PDF metadata
/// and would normally integrate with a PDF generation library like
/// `printpdf` or `lopdf`. The actual binary PDF generation is stubbed
/// for the MVP, returning file metadata only.
pub fn generate_pdf(
    drawing: &DrawingInput,
    config: &PdfExportConfig,
    output_path: &str,
) -> Result<PdfExportResult, String> {
    // Validate input
    if drawing.layers.is_empty() {
        return Err("Drawing has no layers to export".to_string());
    }

    if output_path.is_empty() {
        return Err("Output path cannot be empty".to_string());
    }

    // Count visible layers and elements
    let visible_layers: Vec<&DrawingLayer> =
        drawing.layers.iter().filter(|l| l.is_visible).collect();

    if visible_layers.is_empty() {
        return Err("Drawing has no visible layers to export".to_string());
    }

    let element_count: usize = visible_layers.iter().map(|l| l.elements.len()).sum();

    // Calculate page dimensions
    let (page_width, page_height) = config.page_layout.effective_dimensions();
    let (draw_width, draw_height) = config.page_layout.drawable_area();

    // Generate PDF structure (actual PDF bytes would be created here)
    let pdf_metadata = PdfMetadata {
        title: config.title_block.drawing_title.clone(),
        project: config.title_block.project_name.clone(),
        drawing_number: config.title_block.drawing_number.clone(),
        revision: config.title_block.revision.clone(),
        created_date: config.title_block.date.clone(),
        page_width,
        page_height,
        drawable_width: draw_width,
        drawable_height: draw_height,
        layer_count: visible_layers.len(),
        element_count,
    };

    // For MVP, we simulate file creation by calculating expected size
    // In production, this would use printpdf or similar library
    let estimated_size = estimate_pdf_size(&pdf_metadata);

    Ok(PdfExportResult {
        file_path: output_path.to_string(),
        file_size_bytes: estimated_size,
        page_count: 1, // Single page for now
        generated_at: chrono::Utc::now().to_rfc3339(),
    })
}

// ============================================================================
// PDF Metadata (internal)
// ============================================================================

#[derive(Debug)]
#[allow(dead_code)] // Fields stored for future PDF binary generation
struct PdfMetadata {
    title: String,
    project: String,
    drawing_number: String,
    revision: String,
    created_date: String,
    page_width: f64,
    page_height: f64,
    drawable_width: f64,
    drawable_height: f64,
    layer_count: usize,
    element_count: usize,
}

/// Estimates PDF file size based on content complexity
fn estimate_pdf_size(metadata: &PdfMetadata) -> u64 {
    // Base PDF overhead (headers, fonts, etc.)
    let base_size: u64 = 2048;

    // Size per element (vector graphics, text labels)
    let element_size: u64 = 256;

    // Title block contribution
    let title_block_size: u64 = 512;

    // Metadata contribution
    let metadata_size: u64 = (metadata.title.len()
        + metadata.project.len()
        + metadata.drawing_number.len()
        + metadata.revision.len()
        + metadata.created_date.len()) as u64;

    base_size + (metadata.element_count as u64 * element_size) + title_block_size + metadata_size
}

// ============================================================================
// Tauri Command
// ============================================================================

/// Tauri command to export drawing to PDF
#[tauri::command]
pub fn export_to_pdf(
    drawing: DrawingInput,
    config: PdfExportConfig,
    output_path: String,
) -> Result<PdfExportResult, String> {
    generate_pdf(&drawing, &config, &output_path)
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    // ========================================================================
    // Test Fixtures
    // ========================================================================

    fn create_test_element(id: &str, element_type: ElementType) -> DrawingElement {
        DrawingElement {
            id: id.to_string(),
            element_type,
            x: 100.0,
            y: 100.0,
            rotation: 0.0,
            properties: serde_json::json!({}),
        }
    }

    fn create_test_layer(id: &str, layer_type: LayerType, visible: bool) -> DrawingLayer {
        DrawingLayer {
            id: id.to_string(),
            name: format!("Layer {}", id),
            layer_type,
            is_locked: false,
            is_visible: visible,
            elements: vec![create_test_element("elem-1", ElementType::Equipment)],
        }
    }

    fn create_test_drawing() -> DrawingInput {
        DrawingInput {
            id: "drawing-1".to_string(),
            room_id: "room-1".to_string(),
            drawing_type: DrawingType::Electrical,
            layers: vec![create_test_layer("layer-1", LayerType::AvElements, true)],
        }
    }

    fn create_test_config() -> PdfExportConfig {
        let title_block = TitleBlock::new("Test Project", "Test Drawing");
        PdfExportConfig::new(title_block)
    }

    // ========================================================================
    // PageSize Tests
    // ========================================================================

    #[test]
    fn test_page_size_letter_dimensions() {
        let size = PageSize::Letter;
        let (w, h) = size.dimensions();
        assert_eq!(w, 612.0);
        assert_eq!(h, 792.0);
    }

    #[test]
    fn test_page_size_legal_dimensions() {
        let size = PageSize::Legal;
        let (w, h) = size.dimensions();
        assert_eq!(w, 612.0);
        assert_eq!(h, 1008.0);
    }

    #[test]
    fn test_page_size_tabloid_dimensions() {
        let size = PageSize::Tabloid;
        let (w, h) = size.dimensions();
        assert_eq!(w, 792.0);
        assert_eq!(h, 1224.0);
    }

    #[test]
    fn test_page_size_a4_dimensions() {
        let size = PageSize::A4;
        let (w, h) = size.dimensions();
        assert_eq!(w, 595.0);
        assert_eq!(h, 842.0);
    }

    #[test]
    fn test_page_size_a3_dimensions() {
        let size = PageSize::A3;
        let (w, h) = size.dimensions();
        assert_eq!(w, 842.0);
        assert_eq!(h, 1191.0);
    }

    #[test]
    fn test_page_size_archd_dimensions() {
        let size = PageSize::ArchD;
        let (w, h) = size.dimensions();
        assert_eq!(w, 1728.0);
        assert_eq!(h, 2592.0);
    }

    #[test]
    fn test_page_size_serialization() {
        let size = PageSize::Letter;
        let json = serde_json::to_string(&size).unwrap();
        assert_eq!(json, "\"letter\"");

        let deserialized: PageSize = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized, PageSize::Letter);
    }

    // ========================================================================
    // PageOrientation Tests
    // ========================================================================

    #[test]
    fn test_page_orientation_serialization() {
        let portrait = PageOrientation::Portrait;
        let json = serde_json::to_string(&portrait).unwrap();
        assert_eq!(json, "\"portrait\"");

        let landscape = PageOrientation::Landscape;
        let json = serde_json::to_string(&landscape).unwrap();
        assert_eq!(json, "\"landscape\"");
    }

    // ========================================================================
    // PageLayout Tests
    // ========================================================================

    #[test]
    fn test_page_layout_default() {
        let layout = PageLayout::default();
        assert_eq!(layout.size, PageSize::Letter);
        assert_eq!(layout.orientation, PageOrientation::Landscape);
        assert_eq!(layout.margin_top, 36.0);
        assert_eq!(layout.margin_bottom, 36.0);
        assert_eq!(layout.margin_left, 36.0);
        assert_eq!(layout.margin_right, 36.0);
    }

    #[test]
    fn test_page_layout_effective_dimensions_portrait() {
        let layout = PageLayout {
            orientation: PageOrientation::Portrait,
            ..Default::default()
        };
        let (w, h) = layout.effective_dimensions();
        assert_eq!(w, 612.0);
        assert_eq!(h, 792.0);
    }

    #[test]
    fn test_page_layout_effective_dimensions_landscape() {
        let layout = PageLayout {
            orientation: PageOrientation::Landscape,
            ..Default::default()
        };
        let (w, h) = layout.effective_dimensions();
        assert_eq!(w, 792.0);
        assert_eq!(h, 612.0);
    }

    #[test]
    fn test_page_layout_drawable_area() {
        let layout = PageLayout::default();
        let (w, h) = layout.drawable_area();
        // Landscape Letter (792x612) - margins (36 each side)
        assert_eq!(w, 720.0); // 792 - 36 - 36
        assert_eq!(h, 540.0); // 612 - 36 - 36
    }

    #[test]
    fn test_page_layout_drawable_area_custom_margins() {
        let layout = PageLayout {
            margin_left: 72.0,   // 1"
            margin_right: 72.0,  // 1"
            margin_top: 72.0,    // 1"
            margin_bottom: 72.0, // 1"
            ..Default::default()
        };

        let (w, h) = layout.drawable_area();
        // Landscape Letter (792x612) - margins (72 each side)
        assert_eq!(w, 648.0); // 792 - 72 - 72
        assert_eq!(h, 468.0); // 612 - 72 - 72
    }

    // ========================================================================
    // TitleBlock Tests
    // ========================================================================

    #[test]
    fn test_title_block_new() {
        let tb = TitleBlock::new("My Project", "Electrical Diagram");
        assert_eq!(tb.project_name, "My Project");
        assert_eq!(tb.drawing_title, "Electrical Diagram");
        assert_eq!(tb.revision, "A");
        assert_eq!(tb.scale, "NTS");
        assert_eq!(tb.sheet_number, 1);
        assert_eq!(tb.total_sheets, 1);
    }

    #[test]
    fn test_title_block_serialization() {
        let tb = TitleBlock::new("Project", "Drawing");
        let json = serde_json::to_string(&tb).unwrap();

        assert!(json.contains("\"projectName\":\"Project\""));
        assert!(json.contains("\"drawingTitle\":\"Drawing\""));
        assert!(json.contains("\"revision\":\"A\""));
    }

    // ========================================================================
    // DrawingType Tests
    // ========================================================================

    #[test]
    fn test_drawing_type_serialization() {
        let dt = DrawingType::Electrical;
        let json = serde_json::to_string(&dt).unwrap();
        assert_eq!(json, "\"electrical\"");

        let dt = DrawingType::CableSchedule;
        let json = serde_json::to_string(&dt).unwrap();
        assert_eq!(json, "\"cable_schedule\"");
    }

    // ========================================================================
    // ElementType Tests
    // ========================================================================

    #[test]
    fn test_element_type_serialization() {
        let et = ElementType::Equipment;
        let json = serde_json::to_string(&et).unwrap();
        assert_eq!(json, "\"equipment\"");

        let et = ElementType::Cable;
        let json = serde_json::to_string(&et).unwrap();
        assert_eq!(json, "\"cable\"");
    }

    // ========================================================================
    // LayerType Tests
    // ========================================================================

    #[test]
    fn test_layer_type_serialization() {
        let lt = LayerType::TitleBlock;
        let json = serde_json::to_string(&lt).unwrap();
        assert_eq!(json, "\"title_block\"");

        let lt = LayerType::AvElements;
        let json = serde_json::to_string(&lt).unwrap();
        assert_eq!(json, "\"av_elements\"");
    }

    // ========================================================================
    // PdfExportConfig Tests
    // ========================================================================

    #[test]
    fn test_pdf_export_config_new() {
        let tb = TitleBlock::new("Project", "Drawing");
        let config = PdfExportConfig::new(tb);

        assert!(config.include_layer_info);
        assert!(config.include_timestamp);
        assert_eq!(config.page_layout.size, PageSize::Letter);
    }

    // ========================================================================
    // PDF Generation Tests
    // ========================================================================

    #[test]
    fn test_generate_pdf_success() {
        let drawing = create_test_drawing();
        let config = create_test_config();

        let result = generate_pdf(&drawing, &config, "/tmp/test.pdf");
        assert!(result.is_ok());

        let pdf_result = result.unwrap();
        assert_eq!(pdf_result.file_path, "/tmp/test.pdf");
        assert!(pdf_result.file_size_bytes > 0);
        assert_eq!(pdf_result.page_count, 1);
        assert!(!pdf_result.generated_at.is_empty());
    }

    #[test]
    fn test_generate_pdf_empty_layers_error() {
        let mut drawing = create_test_drawing();
        drawing.layers.clear();
        let config = create_test_config();

        let result = generate_pdf(&drawing, &config, "/tmp/test.pdf");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Drawing has no layers to export");
    }

    #[test]
    fn test_generate_pdf_no_visible_layers_error() {
        let mut drawing = create_test_drawing();
        drawing.layers[0].is_visible = false;
        let config = create_test_config();

        let result = generate_pdf(&drawing, &config, "/tmp/test.pdf");
        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err(),
            "Drawing has no visible layers to export"
        );
    }

    #[test]
    fn test_generate_pdf_empty_output_path_error() {
        let drawing = create_test_drawing();
        let config = create_test_config();

        let result = generate_pdf(&drawing, &config, "");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Output path cannot be empty");
    }

    #[test]
    fn test_generate_pdf_multiple_layers() {
        let mut drawing = create_test_drawing();
        drawing
            .layers
            .push(create_test_layer("layer-2", LayerType::Annotations, true));
        drawing
            .layers
            .push(create_test_layer("layer-3", LayerType::Dimensions, true));
        let config = create_test_config();

        let result = generate_pdf(&drawing, &config, "/tmp/test.pdf");
        assert!(result.is_ok());
    }

    #[test]
    fn test_generate_pdf_mixed_visibility_layers() {
        let mut drawing = create_test_drawing();
        drawing
            .layers
            .push(create_test_layer("layer-2", LayerType::Annotations, false));
        drawing
            .layers
            .push(create_test_layer("layer-3", LayerType::Dimensions, true));
        let config = create_test_config();

        let result = generate_pdf(&drawing, &config, "/tmp/test.pdf");
        assert!(result.is_ok());
    }

    #[test]
    fn test_generate_pdf_has_timestamp() {
        let drawing = create_test_drawing();
        let config = create_test_config();

        let result = generate_pdf(&drawing, &config, "/tmp/test.pdf").unwrap();
        assert!(result.generated_at.contains("T")); // RFC3339 format
    }

    #[test]
    fn test_generate_pdf_size_increases_with_elements() {
        // Create drawing with one element
        let drawing_small = create_test_drawing();
        let config = create_test_config();
        let result_small = generate_pdf(&drawing_small, &config, "/tmp/small.pdf").unwrap();

        // Create drawing with many elements
        let mut drawing_large = create_test_drawing();
        for i in 0..10 {
            drawing_large.layers[0].elements.push(create_test_element(
                &format!("elem-{}", i),
                ElementType::Equipment,
            ));
        }
        let result_large = generate_pdf(&drawing_large, &config, "/tmp/large.pdf").unwrap();

        assert!(result_large.file_size_bytes > result_small.file_size_bytes);
    }

    // ========================================================================
    // Page Layout Integration Tests
    // ========================================================================

    #[test]
    fn test_generate_pdf_with_custom_page_layout() {
        let drawing = create_test_drawing();
        let mut config = create_test_config();
        config.page_layout.size = PageSize::ArchD;
        config.page_layout.orientation = PageOrientation::Landscape;

        let result = generate_pdf(&drawing, &config, "/tmp/archd.pdf");
        assert!(result.is_ok());
    }

    #[test]
    fn test_generate_pdf_with_custom_margins() {
        let drawing = create_test_drawing();
        let mut config = create_test_config();
        config.page_layout.margin_top = 72.0;
        config.page_layout.margin_bottom = 72.0;
        config.page_layout.margin_left = 72.0;
        config.page_layout.margin_right = 72.0;

        let result = generate_pdf(&drawing, &config, "/tmp/margins.pdf");
        assert!(result.is_ok());
    }

    // ========================================================================
    // Title Block Integration Tests
    // ========================================================================

    #[test]
    fn test_generate_pdf_with_full_title_block() {
        let drawing = create_test_drawing();
        let mut config = create_test_config();
        config.title_block.drawing_number = "DWG-001".to_string();
        config.title_block.revision = "B".to_string();
        config.title_block.drawn_by = "John Doe".to_string();
        config.title_block.checked_by = Some("Jane Smith".to_string());
        config.title_block.approved_by = Some("Bob Wilson".to_string());
        config.title_block.scale = "1:50".to_string();
        config.title_block.sheet_number = 1;
        config.title_block.total_sheets = 3;

        let result = generate_pdf(&drawing, &config, "/tmp/full_title.pdf");
        assert!(result.is_ok());
    }

    // ========================================================================
    // DrawingElement Tests
    // ========================================================================

    #[test]
    fn test_drawing_element_serialization() {
        let elem = create_test_element("elem-1", ElementType::Equipment);
        let json = serde_json::to_string(&elem).unwrap();

        assert!(json.contains("\"id\":\"elem-1\""));
        assert!(json.contains("\"type\":\"equipment\""));
        assert!(json.contains("\"x\":100.0"));
        assert!(json.contains("\"y\":100.0"));
        assert!(json.contains("\"rotation\":0.0"));
    }

    #[test]
    fn test_drawing_element_with_properties() {
        let mut elem = create_test_element("elem-1", ElementType::Equipment);
        elem.properties = serde_json::json!({
            "manufacturer": "Poly",
            "model": "Studio X50"
        });

        let json = serde_json::to_string(&elem).unwrap();
        assert!(json.contains("\"manufacturer\":\"Poly\""));
        assert!(json.contains("\"model\":\"Studio X50\""));
    }

    // ========================================================================
    // DrawingLayer Tests
    // ========================================================================

    #[test]
    fn test_drawing_layer_serialization() {
        let layer = create_test_layer("layer-1", LayerType::AvElements, true);
        let json = serde_json::to_string(&layer).unwrap();

        assert!(json.contains("\"id\":\"layer-1\""));
        assert!(json.contains("\"name\":\"Layer layer-1\""));
        assert!(json.contains("\"type\":\"av_elements\""));
        assert!(json.contains("\"isLocked\":false"));
        assert!(json.contains("\"isVisible\":true"));
    }

    #[test]
    fn test_drawing_layer_with_multiple_elements() {
        let mut layer = create_test_layer("layer-1", LayerType::AvElements, true);
        layer
            .elements
            .push(create_test_element("elem-2", ElementType::Cable));
        layer
            .elements
            .push(create_test_element("elem-3", ElementType::Text));

        assert_eq!(layer.elements.len(), 3);
    }

    // ========================================================================
    // DrawingInput Tests
    // ========================================================================

    #[test]
    fn test_drawing_input_serialization() {
        let drawing = create_test_drawing();
        let json = serde_json::to_string(&drawing).unwrap();

        assert!(json.contains("\"id\":\"drawing-1\""));
        assert!(json.contains("\"roomId\":\"room-1\""));
        assert!(json.contains("\"type\":\"electrical\""));
    }

    #[test]
    fn test_drawing_input_deserialization() {
        let json = r#"{
            "id": "dwg-123",
            "roomId": "room-456",
            "type": "elevation",
            "layers": []
        }"#;

        let drawing: DrawingInput = serde_json::from_str(json).unwrap();
        assert_eq!(drawing.id, "dwg-123");
        assert_eq!(drawing.room_id, "room-456");
        assert_eq!(drawing.drawing_type, DrawingType::Elevation);
    }

    // ========================================================================
    // PdfExportResult Tests
    // ========================================================================

    #[test]
    fn test_pdf_export_result_serialization() {
        let result = PdfExportResult {
            file_path: "/tmp/test.pdf".to_string(),
            file_size_bytes: 12345,
            page_count: 1,
            generated_at: "2026-01-18T12:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&result).unwrap();
        assert!(json.contains("\"filePath\":\"/tmp/test.pdf\""));
        assert!(json.contains("\"fileSizeBytes\":12345"));
        assert!(json.contains("\"pageCount\":1"));
    }

    // ========================================================================
    // Estimate PDF Size Tests
    // ========================================================================

    #[test]
    fn test_estimate_pdf_size_base_size() {
        let metadata = PdfMetadata {
            title: "".to_string(),
            project: "".to_string(),
            drawing_number: "".to_string(),
            revision: "".to_string(),
            created_date: "".to_string(),
            page_width: 612.0,
            page_height: 792.0,
            drawable_width: 540.0,
            drawable_height: 720.0,
            layer_count: 0,
            element_count: 0,
        };

        let size = estimate_pdf_size(&metadata);
        // Base size (2048) + title block (512)
        assert_eq!(size, 2560);
    }

    #[test]
    fn test_estimate_pdf_size_with_elements() {
        let metadata = PdfMetadata {
            title: "".to_string(),
            project: "".to_string(),
            drawing_number: "".to_string(),
            revision: "".to_string(),
            created_date: "".to_string(),
            page_width: 612.0,
            page_height: 792.0,
            drawable_width: 540.0,
            drawable_height: 720.0,
            layer_count: 1,
            element_count: 10,
        };

        let size = estimate_pdf_size(&metadata);
        // Base (2048) + elements (10 * 256) + title block (512)
        assert_eq!(size, 5120);
    }

    #[test]
    fn test_estimate_pdf_size_with_metadata() {
        let metadata = PdfMetadata {
            title: "Test".to_string(),              // 4 bytes
            project: "Project".to_string(),         // 7 bytes
            drawing_number: "001".to_string(),      // 3 bytes
            revision: "A".to_string(),              // 1 byte
            created_date: "2026-01-18".to_string(), // 10 bytes
            page_width: 612.0,
            page_height: 792.0,
            drawable_width: 540.0,
            drawable_height: 720.0,
            layer_count: 0,
            element_count: 0,
        };

        let size = estimate_pdf_size(&metadata);
        // Base (2048) + title block (512) + metadata (25)
        assert_eq!(size, 2585);
    }
}
