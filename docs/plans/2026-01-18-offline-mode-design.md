# Offline Mode Design

**Created:** 2026-01-18
**Status:** Ready for Implementation

---

## Overview

Full offline editing capability using SQLite for local storage with:
- Complete create/edit functionality offline
- User-selectable data types for caching
- Smart storage management with auto-purge
- 5-minute sync intervals when online + manual trigger
- Manual conflict resolution for concurrent edits
- Clear sync status indicators throughout UI

---

## Key Decisions

| Aspect | Decision |
|--------|----------|
| Offline Capability | Full editing with sync |
| Local Storage | SQLite via Rust/Tauri |
| Data Caching | User selects per data type |
| Storage Management | Smart auto-purge of old/unused data |
| Sync Interval | Every 5 minutes when online + manual trigger |
| Conflict Handling | Manual resolution with merge option |
| Status Indicators | Status bar + banner + item-level indicators |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Data Access Layer                       ││
│  │   (Checks online status, routes to appropriate DB)   ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
┌───────────────────────┐   ┌───────────────────────────┐
│   Supabase (Cloud)    │   │   SQLite (Local/Rust)     │
│   - Primary storage   │   │   - Offline cache         │
│   - Real-time sync    │   │   - Pending changes queue │
│   - File storage      │   │   - Conflict tracking     │
└───────────────────────┘   └───────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │     Sync Engine       │
              │  - Change detection   │
              │  - Conflict resolver  │
              │  - Queue processor    │
              └───────────────────────┘
```

**Key Workflows**

1. **Online** → Read/write to Supabase, mirror to SQLite
2. **Offline** → Read/write to SQLite, queue changes for sync
3. **Reconnect** → Process queue, detect conflicts, resolve, update both

---

## SQLite Schema

### Sync Metadata Tables

```sql
-- Sync metadata for all cached tables
CREATE TABLE sync_metadata (
  table_name TEXT PRIMARY KEY,
  last_synced_at TEXT,
  is_enabled BOOLEAN DEFAULT 1,
  record_count INTEGER DEFAULT 0
);

-- Pending changes queue
CREATE TABLE pending_changes (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  operation TEXT NOT NULL,        -- 'insert', 'update', 'delete'
  data TEXT NOT NULL,             -- JSON
  created_at TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  UNIQUE(table_name, record_id, operation)
);

-- Conflicts awaiting resolution
CREATE TABLE conflicts (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  local_data TEXT NOT NULL,
  server_data TEXT NOT NULL,
  local_updated_at TEXT NOT NULL,
  server_updated_at TEXT NOT NULL,
  detected_at TEXT NOT NULL,
  resolved_at TEXT,
  resolution TEXT
);

-- Cache settings
CREATE TABLE cache_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### Mirrored Data Tables

Each Supabase table has a local equivalent with sync tracking columns:

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  name TEXT NOT NULL,
  client_id TEXT,
  client_name TEXT,
  status TEXT,
  description TEXT,
  created_at TEXT,
  updated_at TEXT,
  -- Sync tracking
  _synced_at TEXT,
  _is_dirty BOOLEAN DEFAULT 0,
  _is_deleted BOOLEAN DEFAULT 0
);

CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  room_type TEXT,
  width REAL,
  length REAL,
  ceiling_height REAL,
  platform TEXT,
  ecosystem TEXT,
  tier TEXT,
  placed_equipment TEXT,  -- JSON
  created_at TEXT,
  updated_at TEXT,
  _synced_at TEXT,
  _is_dirty BOOLEAN DEFAULT 0,
  _is_deleted BOOLEAN DEFAULT 0
);

-- Similar structure for:
-- equipment, standards, rules, quotes, drawings
```

### Sync Tracking Columns

| Column | Purpose |
|--------|---------|
| `_synced_at` | Last time record synced with server |
| `_is_dirty` | Has local changes not yet synced |
| `_is_deleted` | Soft delete for sync |

---

## Sync Engine

### Sync Process Flow

```
Sync Triggered (timer or manual)
      │
      ▼
1. Check online status
   If offline → abort, schedule retry
      │
      ▼
2. Push local changes
   - Process pending_changes queue
   - Send to Supabase
   - Handle errors/retries
      │
      ▼
3. Detect conflicts
   - Compare updated_at times
   - Create conflict records if needed
      │
      ▼
4. Pull server changes
   - Fetch records where updated_at > last_synced
   - Skip conflicted records
      │
      ▼
5. Update local cache
   - Apply pulled changes
   - Clear synced pending items
   - Update sync_metadata
      │
      ▼
6. Notify UI
   - Conflicts to resolve
   - Sync complete status
```

### Change Detection

```typescript
interface ChangeRecord {
  id: string;
  tableName: string;
  recordId: string;
  operation: 'insert' | 'update' | 'delete';
  data: Record<string, unknown>;
  createdAt: string;
}
```

When user makes changes offline:
1. Update local SQLite table (set `_is_dirty = true`)
2. Insert into `pending_changes` queue
3. UI shows "unsynced" indicator

### Conflict Detection

```typescript
async function detectConflict(
  tableName: string,
  recordId: string,
  localUpdatedAt: string
): Promise<ConflictResult | null> {
  const serverRecord = await supabase
    .from(tableName)
    .select('*')
    .eq('id', recordId)
    .single();

  if (!serverRecord) {
    return { type: 'deleted_on_server', serverRecord: null };
  }

  if (serverRecord.updated_at > localUpdatedAt) {
    return { type: 'concurrent_edit', serverRecord };
  }

  return null;
}
```

### Retry Strategy

| Attempt | Delay | Action |
|---------|-------|--------|
| 1 | Immediate | First try |
| 2 | 30 seconds | Retry |
| 3 | 2 minutes | Retry |
| 4 | 10 minutes | Retry |
| 5+ | Manual | Show error, user retries |

---

## Conflict Resolution

### Conflict Types

| Type | Description | Resolution Options |
|------|-------------|-------------------|
| Concurrent Edit | Same record edited locally and on server | Keep local, keep server, or merge |
| Deleted on Server | Record deleted on server, edited locally | Restore with local data, or discard |
| Deleted Locally | Record deleted locally, edited on server | Delete on server, or restore locally |

### Conflict Resolution UI

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠ Sync Conflict - Room: "Conference Room A"            [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ This room was edited both offline and by another user.     │
│                                                             │
│ ┌─────────────────────────┐ ┌─────────────────────────────┐│
│ │ Your Version            │ │ Server Version              ││
│ │ (Edited offline)        │ │ (Edited by Jane D.)         ││
│ ├─────────────────────────┤ ├─────────────────────────────┤│
│ │ Name: Conf Room A       │ │ Name: Conference Room Alpha ││
│ │ Width: 20 ft ← CHANGED  │ │ Width: 18 ft ← CHANGED      ││
│ │ Length: 25 ft           │ │ Length: 25 ft               ││
│ │ Platform: Teams         │ │ Platform: Zoom ← CHANGED    ││
│ └─────────────────────────┘ └─────────────────────────────┘│
│                                                             │
│ Resolution:                                                 │
│ ○ Keep my version (overwrite server)                       │
│ ○ Keep server version (discard my changes)                 │
│ ● Merge (choose per field below)                           │
│                                                             │
│ Field-by-field merge:                                      │
│ ┌──────────┬─────────────┬───────────────────┬───────────┐│
│ │ Field    │ Your Value  │ Server Value      │ Keep      ││
│ ├──────────┼─────────────┼───────────────────┼───────────┤│
│ │ Name     │ Conf Room A │ Conference Room A │ [Server▼] ││
│ │ Width    │ 20 ft       │ 18 ft             │ [Mine  ▼] ││
│ │ Platform │ Teams       │ Zoom              │ [Server▼] ││
│ └──────────┴─────────────┴───────────────────┴───────────┘│
│                                                             │
├─────────────────────────────────────────────────────────────┤
│           [Skip for Now]              [Apply Resolution]    │
└─────────────────────────────────────────────────────────────┘
```

### Conflict Data Model

```typescript
interface Conflict {
  id: string;
  tableName: string;
  recordId: string;
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  changedFields: string[];
  localUpdatedAt: string;
  serverUpdatedAt: string;
  serverUpdatedBy?: string;
  detectedAt: string;
}

interface ConflictResolution {
  conflictId: string;
  resolution: 'local' | 'server' | 'merged';
  mergedData?: Record<string, unknown>;
}
```

---

## Cache Management

### Cache Settings UI

```
┌─────────────────────────────────────────────────────────────┐
│ Offline Settings                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Offline Data                                                │
│ Select which data to keep available offline:                │
│                                                             │
│ ☑ Projects & Rooms                           142 MB        │
│ ☑ Equipment Catalog                           38 MB        │
│ ☐ Standards & Rules                           12 MB        │
│ ☑ Drawings                                    67 MB        │
│ ☑ Quotes                                      24 MB        │
│                                                             │
│ Storage Used: 271 MB                                        │
│ ████████████████░░░░░░░░░░░░░░░░  54% of 500 MB            │
│                                                             │
│ Auto-Management                                             │
│ ☑ Automatically remove old data when storage is full       │
│                                                             │
│ [Clear All Cache]  [Sync Now]  [View Cache Details]        │
└─────────────────────────────────────────────────────────────┘
```

### Auto-Purge Logic

```typescript
interface PurgeStrategy {
  calculatePriority(record: CachedRecord): number {
    let priority = 0;

    // Recently accessed = higher priority
    const daysSinceAccess = daysBetween(record.lastAccessedAt, now());
    priority += Math.max(0, 100 - daysSinceAccess);

    // Has pending changes = highest priority (never purge)
    if (record.isDirty) priority += 10000;

    // Recently modified = higher priority
    const daysSinceModified = daysBetween(record.updatedAt, now());
    priority += Math.max(0, 50 - daysSinceModified);

    return priority;
  }
}
```

### Purge Rules

| Rule | Description |
|------|-------------|
| Never purge dirty records | Unsynced changes are protected |
| Oldest access first | Least recently viewed goes first |
| Keep related data together | Don't purge room without its drawings |
| Warn before large purge | Ask user if >50% would be purged |

---

## Status Indicators

### Status Bar (Always Visible)

```
● Online   ↻ Synced        (green dot, normal)
● Online   ↻ Syncing...    (green dot, spinner)
● Online   ⚠ 3 conflicts   (green dot, warning)
○ Offline  ↻ 5 pending     (gray dot, count)
○ Offline                  (gray dot)
```

### Offline Banner

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠ You're offline. Changes will sync when connected.   [X] │
└─────────────────────────────────────────────────────────────┘
```

### Item-Level Indicators

| Icon | State | Description |
|------|-------|-------------|
| ✓ | Synced | Up to date with server |
| ↻ | Pending | Has local changes waiting to sync |
| ⟳ | Syncing | Currently uploading/downloading |
| ⚠ | Conflict | Needs manual resolution |
| ✕ | Error | Sync failed |
| ○ | Not cached | Only available online |

### Notification Toasts

| Event | Message |
|-------|---------|
| Go offline | "You're now offline. Changes saved locally." |
| Come online | "Back online. Syncing changes..." |
| Sync complete | "All changes synced." |
| Sync conflict | "3 conflicts need resolution. [View]" |
| Sync error | "Sync failed: {reason}. [Retry]" |

---

## Rust Implementation

### Dependencies

```toml
[dependencies]
rusqlite = { version = "0.32", features = ["bundled"] }
tokio = { version = "1", features = ["sync"] }
serde_json = "1.0"
chrono = "0.4"
```

### Module Structure

```
src-tauri/src/database/
├── mod.rs
├── sqlite.rs               # Connection management
├── migrations.rs           # Schema setup
├── cache.rs                # CRUD operations
├── sync.rs                 # Sync engine
├── conflicts.rs            # Conflict handling
├── purge.rs                # Auto-purge logic
└── queries/
    ├── mod.rs
    ├── projects.rs
    ├── rooms.rs
    ├── equipment.rs
    ├── standards.rs
    ├── quotes.rs
    └── drawings.rs
```

### SQLite Manager

```rust
pub struct SqliteManager {
    conn: Connection,
    db_path: PathBuf,
}

impl SqliteManager {
    pub fn new(app_data_dir: &Path) -> Result<Self, DbError>;
    pub fn run_migrations(&self) -> Result<(), DbError>;

    // Generic CRUD
    pub fn insert<T: Cacheable>(&self, record: &T) -> Result<(), DbError>;
    pub fn update<T: Cacheable>(&self, record: &T) -> Result<(), DbError>;
    pub fn delete(&self, table: &str, id: &str) -> Result<(), DbError>;
    pub fn get<T: Cacheable>(&self, table: &str, id: &str) -> Result<Option<T>, DbError>;
    pub fn list<T: Cacheable>(&self, table: &str, filter: Option<&Filter>) -> Result<Vec<T>, DbError>;

    // Sync tracking
    pub fn mark_dirty(&self, table: &str, id: &str) -> Result<(), DbError>;
    pub fn mark_synced(&self, table: &str, id: &str) -> Result<(), DbError>;
    pub fn get_dirty_records(&self, table: &str) -> Result<Vec<DirtyRecord>, DbError>;

    // Pending changes
    pub fn queue_change(&self, change: &ChangeRecord) -> Result<(), DbError>;
    pub fn get_pending_changes(&self) -> Result<Vec<ChangeRecord>, DbError>;
    pub fn remove_pending_change(&self, id: &str) -> Result<(), DbError>;

    // Cache management
    pub fn get_cache_size(&self) -> Result<u64, DbError>;
    pub fn get_table_sizes(&self) -> Result<HashMap<String, u64>, DbError>;
    pub fn purge_old_records(&self, target_size: u64) -> Result<PurgeResult, DbError>;
}
```

### Sync Engine

```rust
pub struct SyncEngine {
    sqlite: Arc<SqliteManager>,
    supabase_url: String,
    supabase_key: String,
    is_syncing: AtomicBool,
}

impl SyncEngine {
    pub async fn sync(&self) -> Result<SyncResult, SyncError>;
    pub async fn push_changes(&self) -> Result<PushResult, SyncError>;
    pub async fn pull_changes(&self) -> Result<PullResult, SyncError>;
    pub async fn detect_conflicts(&self, table: &str, record_id: &str)
        -> Result<Option<Conflict>, SyncError>;
    pub async fn resolve_conflict(&self, resolution: ConflictResolution)
        -> Result<(), SyncError>;
}

pub struct SyncResult {
    pub pushed: u32,
    pub pulled: u32,
    pub conflicts: Vec<Conflict>,
    pub errors: Vec<SyncError>,
    pub duration_ms: u64,
}
```

### Tauri Commands

```rust
// Cache operations
#[tauri::command]
pub async fn cache_get<T>(table: String, id: String) -> Result<Option<T>, String>;

#[tauri::command]
pub async fn cache_list<T>(table: String, filter: Option<Filter>) -> Result<Vec<T>, String>;

#[tauri::command]
pub async fn cache_save<T>(table: String, record: T) -> Result<(), String>;

#[tauri::command]
pub async fn cache_delete(table: String, id: String) -> Result<(), String>;

// Sync operations
#[tauri::command]
pub async fn sync_now() -> Result<SyncResult, String>;

#[tauri::command]
pub async fn get_sync_status() -> Result<SyncStatus, String>;

#[tauri::command]
pub async fn get_pending_count() -> Result<u32, String>;

// Conflict operations
#[tauri::command]
pub async fn get_conflicts() -> Result<Vec<Conflict>, String>;

#[tauri::command]
pub async fn resolve_conflict(resolution: ConflictResolution) -> Result<(), String>;

// Cache management
#[tauri::command]
pub async fn get_cache_stats() -> Result<CacheStats, String>;

#[tauri::command]
pub async fn set_cache_settings(settings: CacheSettings) -> Result<(), String>;

#[tauri::command]
pub async fn clear_cache(table: Option<String>) -> Result<(), String>;

// Online status
#[tauri::command]
pub fn check_online() -> bool;
```

---

## Frontend Integration

### Data Access Layer

```typescript
class DataAccess {
  private isOnline: boolean = true;

  async get<T>(table: string, id: string): Promise<T | null> {
    if (this.isOnline) {
      try {
        const result = await supabase.from(table).select('*').eq('id', id).single();
        await invoke('cache_save', { table, record: result.data });
        return result.data;
      } catch {
        return invoke('cache_get', { table, id });
      }
    }
    return invoke('cache_get', { table, id });
  }

  async save<T>(table: string, record: T): Promise<T> {
    await invoke('cache_save', { table, record });

    if (this.isOnline) {
      try {
        const result = await supabase.from(table).upsert(record).select().single();
        await invoke('mark_synced', { table, id: record.id });
        return result.data;
      } catch {
        await invoke('queue_change', {
          table,
          recordId: record.id,
          operation: 'upsert',
          data: record
        });
        return record;
      }
    }

    await invoke('queue_change', {
      table,
      recordId: record.id,
      operation: 'upsert',
      data: record
    });
    return record;
  }

  onStatusChange(callback: (online: boolean) => void): () => void;
  checkOnline(): Promise<boolean>;
}

export const dataAccess = new DataAccess();
```

### React Hooks

```typescript
// Sync status and operations
export function useSync() {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (await dataAccess.checkOnline()) {
        await syncNow();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const syncNow = async () => { ... };

  return { status, pendingCount, conflicts, lastSynced, syncNow };
}

// Online status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    return dataAccess.onStatusChange(setIsOnline);
  }, []);

  return isOnline;
}

// Offline-aware queries
export function useOfflineQuery<T>(table: string, id: string) {
  const isOnline = useOnlineStatus();

  return useQuery({
    queryKey: [table, id, isOnline],
    queryFn: () => dataAccess.get<T>(table, id),
    staleTime: isOnline ? 30000 : Infinity,
  });
}

export function useOfflineMutation<T>(table: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (record: T) => dataAccess.save(table, record),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
  });
}
```

### Zustand Store

```typescript
interface OfflineState {
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  pendingCount: number;
  conflictCount: number;
  lastSyncedAt: string | null;
  cacheSettings: CacheSettings;
  cacheStats: CacheStats | null;

  setOnline: (online: boolean) => void;
  setSyncStatus: (status: SyncStatus) => void;
  updatePendingCount: (count: number) => void;
  updateConflictCount: (count: number) => void;
  setCacheSettings: (settings: CacheSettings) => void;
  setCacheStats: (stats: CacheStats) => void;
}
```

---

## File Structure

### New Files

```
src-tauri/
├── Cargo.toml                      # Add rusqlite
└── src/
    └── database/
        ├── mod.rs
        ├── sqlite.rs
        ├── migrations.rs
        ├── cache.rs
        ├── sync.rs
        ├── conflicts.rs
        ├── purge.rs
        └── queries/
            ├── mod.rs
            ├── projects.rs
            ├── rooms.rs
            ├── equipment.rs
            ├── standards.rs
            ├── quotes.rs
            └── drawings.rs

src/
├── lib/
│   └── data-access.ts
├── features/
│   └── offline/
│       ├── use-sync.ts
│       ├── use-offline-query.ts
│       ├── components/
│       │   ├── SyncStatusBar.tsx
│       │   ├── OfflineBanner.tsx
│       │   ├── ConflictModal.tsx
│       │   ├── ConflictList.tsx
│       │   ├── ConflictResolver.tsx
│       │   ├── CacheSettings.tsx
│       │   ├── CacheDetails.tsx
│       │   ├── SyncIndicator.tsx
│       │   └── index.ts
│       ├── types.ts
│       └── index.ts
├── stores/
│   └── offline-store.ts
└── styles/
    └── features/
        └── offline.css
```

---

## Testing Strategy

### Rust Tests

- SQLite CRUD operations
- Sync engine logic
- Conflict detection
- Auto-purge algorithm
- Migration scripts

### Frontend Tests

- Data access layer routing
- Online/offline state transitions
- Conflict resolution UI
- Cache settings persistence
- Sync status updates

### E2E Tests

- Complete offline workflow
- Edit offline, sync when online
- Conflict creation and resolution
- Cache size management
- Multi-device conflict scenario
