//! Electrical Line Diagram Generator
//!
//! Generates electrical line diagrams from room equipment data.
//! Analyzes signal flow between equipment and creates diagram elements.

use serde::{Deserialize, Serialize};

// ============================================================================
// Equipment Category - mirrors TypeScript definitions
// ============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum EquipmentCategory {
    Video,
    Audio,
    Control,
    Infrastructure,
}

// ============================================================================
// Mount Type - mirrors TypeScript definitions
// ============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MountType {
    Floor,
    Wall,
    Ceiling,
    Rack,
}

// ============================================================================
// Element Type - for drawing elements
// ============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ElementType {
    Equipment,
    Cable,
    Text,
    Dimension,
    Symbol,
}

// ============================================================================
// Signal Type - for signal flow analysis
// ============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SignalType {
    Video,
    Audio,
    Control,
    Power,
    Network,
}

// ============================================================================
// Equipment Input Data - from frontend
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EquipmentInput {
    pub id: String,
    pub manufacturer: String,
    pub model: String,
    pub category: EquipmentCategory,
    pub subcategory: String,
}

// ============================================================================
// Placed Equipment Input - from frontend
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlacedEquipmentInput {
    pub id: String,
    pub equipment_id: String,
    pub x: f64,
    pub y: f64,
    pub rotation: f64,
    pub mount_type: MountType,
}

// ============================================================================
// Room Input - from frontend
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RoomInput {
    pub id: String,
    pub name: String,
    pub width: f64,
    pub length: f64,
    pub ceiling_height: f64,
    pub placed_equipment: Vec<PlacedEquipmentInput>,
}

// ============================================================================
// Drawing Element - output element in diagram
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DrawingElement {
    pub id: String,
    pub element_type: ElementType,
    pub x: f64,
    pub y: f64,
    pub rotation: f64,
    pub label: String,
    pub properties: serde_json::Value,
}

// ============================================================================
// Signal Connection - connection between equipment
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SignalConnection {
    pub id: String,
    pub from_equipment_id: String,
    pub to_equipment_id: String,
    pub signal_type: SignalType,
    pub cable_type: String,
}

// ============================================================================
// Electrical Diagram - full diagram output
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElectricalDiagram {
    pub room_id: String,
    pub elements: Vec<DrawingElement>,
    pub connections: Vec<SignalConnection>,
    pub generated_at: String,
}

// ============================================================================
// Electrical Diagram Generator
// ============================================================================

/// Generates an electrical line diagram from room and equipment data
pub fn generate_electrical_diagram(
    room: &RoomInput,
    equipment_catalog: &[EquipmentInput],
) -> Result<ElectricalDiagram, String> {
    if room.placed_equipment.is_empty() {
        return Ok(ElectricalDiagram {
            room_id: room.id.clone(),
            elements: Vec::new(),
            connections: Vec::new(),
            generated_at: chrono::Utc::now().to_rfc3339(),
        });
    }

    let mut elements = Vec::new();

    // Create drawing elements for each placed equipment
    for placed in &room.placed_equipment {
        let equipment = equipment_catalog
            .iter()
            .find(|e| e.id == placed.equipment_id);

        let label = match equipment {
            Some(eq) => format!("{} {}", eq.manufacturer, eq.model),
            None => format!("Unknown Equipment ({})", placed.equipment_id),
        };

        elements.push(DrawingElement {
            id: format!("elem-{}", placed.id),
            element_type: ElementType::Equipment,
            x: placed.x,
            y: placed.y,
            rotation: placed.rotation,
            label,
            properties: serde_json::json!({
                "equipment_id": placed.equipment_id,
                "mount_type": placed.mount_type,
            }),
        });
    }

    // Analyze signal flow to create connections
    let connections = analyze_signal_flow(room, equipment_catalog);

    Ok(ElectricalDiagram {
        room_id: room.id.clone(),
        elements,
        connections,
        generated_at: chrono::Utc::now().to_rfc3339(),
    })
}

/// Analyzes signal flow between equipment to determine connections
pub fn analyze_signal_flow(
    room: &RoomInput,
    equipment_catalog: &[EquipmentInput],
) -> Vec<SignalConnection> {
    let mut connections = Vec::new();

    // Find equipment by category for signal routing
    let mut video_sources: Vec<&PlacedEquipmentInput> = Vec::new();
    let mut video_displays: Vec<&PlacedEquipmentInput> = Vec::new();
    let mut audio_sources: Vec<&PlacedEquipmentInput> = Vec::new();
    let mut audio_outputs: Vec<&PlacedEquipmentInput> = Vec::new();
    let mut control_devices: Vec<&PlacedEquipmentInput> = Vec::new();

    for placed in &room.placed_equipment {
        if let Some(equipment) = equipment_catalog
            .iter()
            .find(|e| e.id == placed.equipment_id)
        {
            match equipment.category {
                EquipmentCategory::Video => match equipment.subcategory.as_str() {
                    "cameras" | "codecs" => video_sources.push(placed),
                    "displays" => video_displays.push(placed),
                    _ => {}
                },
                EquipmentCategory::Audio => match equipment.subcategory.as_str() {
                    "microphones" => audio_sources.push(placed),
                    "speakers" | "amplifiers" => audio_outputs.push(placed),
                    _ => {}
                },
                EquipmentCategory::Control => {
                    control_devices.push(placed);
                }
                EquipmentCategory::Infrastructure => {
                    // Infrastructure doesn't typically create signal connections
                }
            }
        }
    }

    // Create video signal connections: sources -> displays
    for (idx, source) in video_sources.iter().enumerate() {
        for display in &video_displays {
            connections.push(SignalConnection {
                id: format!("conn-video-{}-{}", source.id, display.id),
                from_equipment_id: source.equipment_id.clone(),
                to_equipment_id: display.equipment_id.clone(),
                signal_type: SignalType::Video,
                cable_type: determine_video_cable_type(idx),
            });
        }
    }

    // Create audio signal connections: sources -> outputs
    for source in &audio_sources {
        for output in &audio_outputs {
            connections.push(SignalConnection {
                id: format!("conn-audio-{}-{}", source.id, output.id),
                from_equipment_id: source.equipment_id.clone(),
                to_equipment_id: output.equipment_id.clone(),
                signal_type: SignalType::Audio,
                cable_type: "XLR".to_string(),
            });
        }
    }

    // Create control connections from control devices to all other equipment
    for control in &control_devices {
        for placed in &room.placed_equipment {
            if placed.id != control.id {
                connections.push(SignalConnection {
                    id: format!("conn-ctrl-{}-{}", control.id, placed.id),
                    from_equipment_id: control.equipment_id.clone(),
                    to_equipment_id: placed.equipment_id.clone(),
                    signal_type: SignalType::Control,
                    cable_type: "Cat6".to_string(),
                });
            }
        }
    }

    connections
}

/// Determines video cable type based on connection index
fn determine_video_cable_type(index: usize) -> String {
    // First source typically uses HDMI, subsequent sources may use other types
    match index {
        0 => "HDMI".to_string(),
        1 => "DisplayPort".to_string(),
        _ => "SDI".to_string(),
    }
}

// ============================================================================
// Tauri Command
// ============================================================================

/// Tauri command to generate electrical diagram
#[tauri::command]
pub fn generate_electrical(
    room: RoomInput,
    equipment_catalog: Vec<EquipmentInput>,
) -> Result<ElectricalDiagram, String> {
    generate_electrical_diagram(&room, &equipment_catalog)
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_equipment(
        id: &str,
        category: EquipmentCategory,
        subcategory: &str,
    ) -> EquipmentInput {
        EquipmentInput {
            id: id.to_string(),
            manufacturer: "Test Manufacturer".to_string(),
            model: format!("Model {}", id),
            category,
            subcategory: subcategory.to_string(),
        }
    }

    fn create_test_placed_equipment(id: &str, equipment_id: &str) -> PlacedEquipmentInput {
        PlacedEquipmentInput {
            id: id.to_string(),
            equipment_id: equipment_id.to_string(),
            x: 100.0,
            y: 100.0,
            rotation: 0.0,
            mount_type: MountType::Floor,
        }
    }

    fn create_test_room(placed_equipment: Vec<PlacedEquipmentInput>) -> RoomInput {
        RoomInput {
            id: "room-1".to_string(),
            name: "Test Room".to_string(),
            width: 20.0,
            length: 20.0,
            ceiling_height: 10.0,
            placed_equipment,
        }
    }

    // ========================================================================
    // Type Serialization Tests
    // ========================================================================

    #[test]
    fn test_equipment_category_serialization() {
        let category = EquipmentCategory::Video;
        let json = serde_json::to_string(&category).unwrap();
        assert_eq!(json, "\"video\"");

        let deserialized: EquipmentCategory = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized, EquipmentCategory::Video);
    }

    #[test]
    fn test_mount_type_serialization() {
        let mount = MountType::Ceiling;
        let json = serde_json::to_string(&mount).unwrap();
        assert_eq!(json, "\"ceiling\"");

        let deserialized: MountType = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized, MountType::Ceiling);
    }

    #[test]
    fn test_element_type_serialization() {
        let element_type = ElementType::Cable;
        let json = serde_json::to_string(&element_type).unwrap();
        assert_eq!(json, "\"cable\"");
    }

    #[test]
    fn test_signal_type_serialization() {
        let signal_type = SignalType::Network;
        let json = serde_json::to_string(&signal_type).unwrap();
        assert_eq!(json, "\"network\"");
    }

    // ========================================================================
    // Empty Room Tests
    // ========================================================================

    #[test]
    fn test_generate_diagram_empty_room() {
        let room = create_test_room(vec![]);
        let catalog: Vec<EquipmentInput> = vec![];

        let result = generate_electrical_diagram(&room, &catalog);
        assert!(result.is_ok());

        let diagram = result.unwrap();
        assert_eq!(diagram.room_id, "room-1");
        assert!(diagram.elements.is_empty());
        assert!(diagram.connections.is_empty());
    }

    // ========================================================================
    // Single Equipment Tests
    // ========================================================================

    #[test]
    fn test_generate_diagram_single_equipment() {
        let camera = create_test_equipment("eq-1", EquipmentCategory::Video, "cameras");
        let placed = create_test_placed_equipment("placed-1", "eq-1");
        let room = create_test_room(vec![placed]);
        let catalog = vec![camera];

        let result = generate_electrical_diagram(&room, &catalog);
        assert!(result.is_ok());

        let diagram = result.unwrap();
        assert_eq!(diagram.elements.len(), 1);
        assert_eq!(diagram.elements[0].label, "Test Manufacturer Model eq-1");
        assert_eq!(diagram.elements[0].element_type, ElementType::Equipment);
    }

    #[test]
    fn test_generate_diagram_unknown_equipment() {
        let placed = create_test_placed_equipment("placed-1", "unknown-eq");
        let room = create_test_room(vec![placed]);
        let catalog: Vec<EquipmentInput> = vec![];

        let result = generate_electrical_diagram(&room, &catalog);
        assert!(result.is_ok());

        let diagram = result.unwrap();
        assert_eq!(diagram.elements.len(), 1);
        assert!(diagram.elements[0].label.contains("Unknown Equipment"));
    }

    // ========================================================================
    // Signal Flow Tests
    // ========================================================================

    #[test]
    fn test_video_signal_flow() {
        let camera = create_test_equipment("camera-1", EquipmentCategory::Video, "cameras");
        let display = create_test_equipment("display-1", EquipmentCategory::Video, "displays");

        let placed_camera = create_test_placed_equipment("placed-camera", "camera-1");
        let placed_display = create_test_placed_equipment("placed-display", "display-1");

        let room = create_test_room(vec![placed_camera, placed_display]);
        let catalog = vec![camera, display];

        let result = generate_electrical_diagram(&room, &catalog);
        assert!(result.is_ok());

        let diagram = result.unwrap();

        // Should have video connection from camera to display
        let video_connections: Vec<_> = diagram
            .connections
            .iter()
            .filter(|c| c.signal_type == SignalType::Video)
            .collect();

        assert_eq!(video_connections.len(), 1);
        assert_eq!(video_connections[0].from_equipment_id, "camera-1");
        assert_eq!(video_connections[0].to_equipment_id, "display-1");
        assert_eq!(video_connections[0].cable_type, "HDMI");
    }

    #[test]
    fn test_audio_signal_flow() {
        let mic = create_test_equipment("mic-1", EquipmentCategory::Audio, "microphones");
        let speaker = create_test_equipment("speaker-1", EquipmentCategory::Audio, "speakers");

        let placed_mic = create_test_placed_equipment("placed-mic", "mic-1");
        let placed_speaker = create_test_placed_equipment("placed-speaker", "speaker-1");

        let room = create_test_room(vec![placed_mic, placed_speaker]);
        let catalog = vec![mic, speaker];

        let result = generate_electrical_diagram(&room, &catalog);
        assert!(result.is_ok());

        let diagram = result.unwrap();

        // Should have audio connection from mic to speaker
        let audio_connections: Vec<_> = diagram
            .connections
            .iter()
            .filter(|c| c.signal_type == SignalType::Audio)
            .collect();

        assert_eq!(audio_connections.len(), 1);
        assert_eq!(audio_connections[0].from_equipment_id, "mic-1");
        assert_eq!(audio_connections[0].to_equipment_id, "speaker-1");
        assert_eq!(audio_connections[0].cable_type, "XLR");
    }

    #[test]
    fn test_control_signal_flow() {
        let processor = create_test_equipment("proc-1", EquipmentCategory::Control, "processors");
        let display = create_test_equipment("display-1", EquipmentCategory::Video, "displays");

        let placed_proc = create_test_placed_equipment("placed-proc", "proc-1");
        let placed_display = create_test_placed_equipment("placed-display", "display-1");

        let room = create_test_room(vec![placed_proc, placed_display]);
        let catalog = vec![processor, display];

        let result = generate_electrical_diagram(&room, &catalog);
        assert!(result.is_ok());

        let diagram = result.unwrap();

        // Should have control connection from processor to display
        let control_connections: Vec<_> = diagram
            .connections
            .iter()
            .filter(|c| c.signal_type == SignalType::Control)
            .collect();

        assert_eq!(control_connections.len(), 1);
        assert_eq!(control_connections[0].from_equipment_id, "proc-1");
        assert_eq!(control_connections[0].cable_type, "Cat6");
    }

    #[test]
    fn test_multiple_video_sources_different_cables() {
        let camera1 = create_test_equipment("camera-1", EquipmentCategory::Video, "cameras");
        let camera2 = create_test_equipment("camera-2", EquipmentCategory::Video, "cameras");
        let display = create_test_equipment("display-1", EquipmentCategory::Video, "displays");

        let placed_camera1 = create_test_placed_equipment("placed-camera1", "camera-1");
        let placed_camera2 = create_test_placed_equipment("placed-camera2", "camera-2");
        let placed_display = create_test_placed_equipment("placed-display", "display-1");

        let room = create_test_room(vec![placed_camera1, placed_camera2, placed_display]);
        let catalog = vec![camera1, camera2, display];

        let result = generate_electrical_diagram(&room, &catalog);
        assert!(result.is_ok());

        let diagram = result.unwrap();

        let video_connections: Vec<_> = diagram
            .connections
            .iter()
            .filter(|c| c.signal_type == SignalType::Video)
            .collect();

        // Two video sources connecting to one display
        assert_eq!(video_connections.len(), 2);

        // First source uses HDMI, second uses DisplayPort
        assert_eq!(video_connections[0].cable_type, "HDMI");
        assert_eq!(video_connections[1].cable_type, "DisplayPort");
    }

    // ========================================================================
    // Complex Room Tests
    // ========================================================================

    #[test]
    fn test_full_conference_room() {
        let camera = create_test_equipment("camera-1", EquipmentCategory::Video, "cameras");
        let display = create_test_equipment("display-1", EquipmentCategory::Video, "displays");
        let mic = create_test_equipment("mic-1", EquipmentCategory::Audio, "microphones");
        let speaker = create_test_equipment("speaker-1", EquipmentCategory::Audio, "speakers");
        let processor = create_test_equipment("proc-1", EquipmentCategory::Control, "processors");

        let room = create_test_room(vec![
            create_test_placed_equipment("p-camera", "camera-1"),
            create_test_placed_equipment("p-display", "display-1"),
            create_test_placed_equipment("p-mic", "mic-1"),
            create_test_placed_equipment("p-speaker", "speaker-1"),
            create_test_placed_equipment("p-proc", "proc-1"),
        ]);

        let catalog = vec![camera, display, mic, speaker, processor];

        let result = generate_electrical_diagram(&room, &catalog);
        assert!(result.is_ok());

        let diagram = result.unwrap();

        // Should have 5 elements
        assert_eq!(diagram.elements.len(), 5);

        // Count connection types
        let video_count = diagram
            .connections
            .iter()
            .filter(|c| c.signal_type == SignalType::Video)
            .count();
        let audio_count = diagram
            .connections
            .iter()
            .filter(|c| c.signal_type == SignalType::Audio)
            .count();
        let control_count = diagram
            .connections
            .iter()
            .filter(|c| c.signal_type == SignalType::Control)
            .count();

        // Video: camera -> display (1)
        assert_eq!(video_count, 1);
        // Audio: mic -> speaker (1)
        assert_eq!(audio_count, 1);
        // Control: processor -> all other equipment (4)
        assert_eq!(control_count, 4);
    }

    // ========================================================================
    // Element Position Tests
    // ========================================================================

    #[test]
    fn test_element_positions_preserved() {
        let camera = create_test_equipment("camera-1", EquipmentCategory::Video, "cameras");

        let mut placed = create_test_placed_equipment("placed-1", "camera-1");
        placed.x = 250.0;
        placed.y = 350.0;
        placed.rotation = 45.0;

        let room = create_test_room(vec![placed]);
        let catalog = vec![camera];

        let result = generate_electrical_diagram(&room, &catalog);
        assert!(result.is_ok());

        let diagram = result.unwrap();
        assert_eq!(diagram.elements[0].x, 250.0);
        assert_eq!(diagram.elements[0].y, 350.0);
        assert_eq!(diagram.elements[0].rotation, 45.0);
    }

    #[test]
    fn test_element_properties_include_metadata() {
        let camera = create_test_equipment("camera-1", EquipmentCategory::Video, "cameras");

        let mut placed = create_test_placed_equipment("placed-1", "camera-1");
        placed.mount_type = MountType::Ceiling;

        let room = create_test_room(vec![placed]);
        let catalog = vec![camera];

        let result = generate_electrical_diagram(&room, &catalog);
        assert!(result.is_ok());

        let diagram = result.unwrap();
        let props = &diagram.elements[0].properties;

        assert_eq!(props["equipment_id"], "camera-1");
        assert_eq!(props["mount_type"], "ceiling");
    }

    // ========================================================================
    // Infrastructure Tests
    // ========================================================================

    #[test]
    fn test_infrastructure_no_signal_connections() {
        let rack = create_test_equipment("rack-1", EquipmentCategory::Infrastructure, "racks");
        let camera = create_test_equipment("camera-1", EquipmentCategory::Video, "cameras");

        let room = create_test_room(vec![
            create_test_placed_equipment("p-rack", "rack-1"),
            create_test_placed_equipment("p-camera", "camera-1"),
        ]);

        let catalog = vec![rack, camera];

        let result = generate_electrical_diagram(&room, &catalog);
        assert!(result.is_ok());

        let diagram = result.unwrap();

        // Infrastructure should not create signal connections
        assert!(diagram.connections.is_empty());
    }

    // ========================================================================
    // Codec Tests (Video Source)
    // ========================================================================

    #[test]
    fn test_codec_as_video_source() {
        let codec = create_test_equipment("codec-1", EquipmentCategory::Video, "codecs");
        let display = create_test_equipment("display-1", EquipmentCategory::Video, "displays");

        let room = create_test_room(vec![
            create_test_placed_equipment("p-codec", "codec-1"),
            create_test_placed_equipment("p-display", "display-1"),
        ]);

        let catalog = vec![codec, display];

        let result = generate_electrical_diagram(&room, &catalog);
        assert!(result.is_ok());

        let diagram = result.unwrap();

        let video_connections: Vec<_> = diagram
            .connections
            .iter()
            .filter(|c| c.signal_type == SignalType::Video)
            .collect();

        assert_eq!(video_connections.len(), 1);
        assert_eq!(video_connections[0].from_equipment_id, "codec-1");
    }

    // ========================================================================
    // Amplifier Tests (Audio Output)
    // ========================================================================

    #[test]
    fn test_amplifier_as_audio_output() {
        let mic = create_test_equipment("mic-1", EquipmentCategory::Audio, "microphones");
        let amp = create_test_equipment("amp-1", EquipmentCategory::Audio, "amplifiers");

        let room = create_test_room(vec![
            create_test_placed_equipment("p-mic", "mic-1"),
            create_test_placed_equipment("p-amp", "amp-1"),
        ]);

        let catalog = vec![mic, amp];

        let result = generate_electrical_diagram(&room, &catalog);
        assert!(result.is_ok());

        let diagram = result.unwrap();

        let audio_connections: Vec<_> = diagram
            .connections
            .iter()
            .filter(|c| c.signal_type == SignalType::Audio)
            .collect();

        assert_eq!(audio_connections.len(), 1);
        assert_eq!(audio_connections[0].to_equipment_id, "amp-1");
    }

    // ========================================================================
    // Timestamp Tests
    // ========================================================================

    #[test]
    fn test_diagram_has_timestamp() {
        let room = create_test_room(vec![]);
        let catalog: Vec<EquipmentInput> = vec![];

        let result = generate_electrical_diagram(&room, &catalog);
        assert!(result.is_ok());

        let diagram = result.unwrap();
        assert!(!diagram.generated_at.is_empty());
        // Should be valid RFC3339 timestamp
        assert!(diagram.generated_at.contains("T"));
    }

    // ========================================================================
    // Analyze Signal Flow Direct Tests
    // ========================================================================

    #[test]
    fn test_analyze_signal_flow_empty_room() {
        let room = create_test_room(vec![]);
        let catalog: Vec<EquipmentInput> = vec![];

        let connections = analyze_signal_flow(&room, &catalog);
        assert!(connections.is_empty());
    }

    #[test]
    fn test_analyze_signal_flow_returns_connections() {
        let camera = create_test_equipment("camera-1", EquipmentCategory::Video, "cameras");
        let display = create_test_equipment("display-1", EquipmentCategory::Video, "displays");

        let room = create_test_room(vec![
            create_test_placed_equipment("p-camera", "camera-1"),
            create_test_placed_equipment("p-display", "display-1"),
        ]);

        let catalog = vec![camera, display];

        let connections = analyze_signal_flow(&room, &catalog);
        assert!(!connections.is_empty());
    }

    // ========================================================================
    // Cable Type Tests
    // ========================================================================

    #[test]
    fn test_determine_video_cable_type() {
        assert_eq!(determine_video_cable_type(0), "HDMI");
        assert_eq!(determine_video_cable_type(1), "DisplayPort");
        assert_eq!(determine_video_cable_type(2), "SDI");
        assert_eq!(determine_video_cable_type(10), "SDI");
    }
}
