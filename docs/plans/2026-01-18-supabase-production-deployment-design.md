# Supabase Production Deployment Design

**Created:** 2026-01-18
**Status:** Ready for Implementation

---

## Overview

Single production environment deployment on Supabase Pro/Team plan with:
- Direct cloud connection for all development and production use
- Schema changes via `supabase db push` from local machine
- Daily automated backups + periodic manual pg_dump exports
- Mixed storage: public bucket for assets, per-org private buckets for project files
- Maximum security: SSL, rate limiting, IP allowlist, custom JWT settings
- Desktop app distribution via GitHub Releases with Tauri auto-updater
- Code signing for macOS and Windows

---

## Prerequisites

### Certificates Required (Release Blockers)

| Platform | Certificate | Where to Get | Cost | Timeline |
|----------|-------------|--------------|------|----------|
| macOS | Developer ID Application | Apple Developer Program | $99/year | 1-2 days |
| Windows | OV Code Signing | DigiCert, Sectigo, SSL.com | $200-400/year | 3-5 days |

### Tauri Signing Key

Generate before first release:

```bash
npx tauri signer generate -w ~/.tauri/av-designer.key
```

Store private key securely - needed for every build.

---

## Supabase Project Configuration

### Auth Providers

| Provider | Configuration |
|----------|---------------|
| Email | Enabled, confirm email required, secure password policy |
| Microsoft | Azure AD app registration, tenant: common (any org) |
| Google | Google Cloud OAuth credentials |

### Auth Settings

| Setting | Value |
|---------|-------|
| Site URL | `https://avdesigner.app` (or your domain) |
| Redirect URLs | `avdesigner://auth/callback` (desktop app deep link) |
| JWT Expiry | 3600 seconds (1 hour), refresh tokens enabled |
| Email templates | Customized with AV Designer branding |
| Rate limiting | 30 requests/hour for signup, 5 for password reset |
| Password policy | 8+ characters, complexity required |
| Leaked password protection | Enabled |
| CAPTCHA | hCaptcha enabled for signup |

### Database Settings

| Setting | Value |
|---------|-------|
| Connection pooling | Enabled (transaction mode) |
| Pool size | Default (15 connections for Pro) |
| SSL | Required for all connections |
| Statement timeout | 30 seconds |

### API Settings

| Setting | Value |
|---------|-------|
| API rate limiting | 1000 requests/second per client |
| Max rows returned | 1000 (default) |
| Schema exposure | Only `public` schema via API |

---

## Storage Configuration

### Bucket Structure

| Bucket | Visibility | Created | Purpose |
|--------|------------|---------|---------|
| `public-assets` | Public | Once, manually | Shared assets across all orgs |
| `org-{org_id}-files` | Private | Dynamically on org creation | Organization project files |

### Public Assets Bucket Structure

```
public-assets/
├── avatars/
│   └── {user_id}.{ext}          # User profile pictures
├── equipment/
│   └── {equipment_id}.{ext}     # Equipment catalog images
├── org-logos/
│   └── {org_id}.{ext}           # Organization logos
└── app/
    └── {asset_name}.{ext}       # App-wide assets
```

### Organization Bucket Structure

```
org-{org_id}-files/
├── projects/
│   └── {project_id}/
│       ├── attachments/         # Project-level files
│       └── rooms/
│           └── {room_id}/
│               ├── drawings/    # Generated drawings
│               ├── cad/         # Uploaded CAD files
│               └── exports/     # PDF exports
```

### Storage Policies

| Bucket | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| public-assets | Anyone | Authenticated | Owner or admin | Owner or admin |
| org-{id}-files | Org members | Editor+ | Editor+ | Editor+ |

### Bucket Creation Automation

When an organization is created:
1. Database trigger fires on `organizations` insert
2. Trigger calls Edge Function `create-org-bucket`
3. Edge Function creates `org-{org_id}-files` bucket with RLS policy

---

## Security Settings

### SSL Configuration

| Setting | Value |
|---------|-------|
| API connections | SSL required (enforced by Supabase) |
| Database direct connections | SSL required (`sslmode=require`) |
| Connection string | Always use `?sslmode=require` |

### IP Allowlist (Database Direct Access)

Only needed for direct PostgreSQL connections (not API):

| Use Case | Action |
|----------|--------|
| Developer machines | Add as needed, document in team wiki |
| CI/CD pipeline | Use API instead, or add GitHub Actions IPs |
| Backup scripts | Add server running pg_dump |

Note: Desktop app uses Supabase API (anon key + RLS), no IP allowlist needed.

### JWT Configuration

| Setting | Value |
|---------|-------|
| Access token expiry | 3600 seconds (1 hour) |
| Refresh token expiry | 604800 seconds (7 days) |
| Refresh token rotation | Enabled |
| Refresh token reuse interval | 10 seconds |

### Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Auth: signup | 30/hour per IP |
| Auth: token refresh | 360/hour per IP |
| Auth: password reset | 5/hour per email |
| API: general | 1000/second per client |
| Storage: uploads | 100/minute per user |

---

## Backup Strategy

### Automated Backups (Supabase Pro)

| Setting | Value |
|---------|-------|
| Frequency | Daily |
| Retention | 7 days |
| Type | Full database snapshot |
| Restore | Via Supabase Dashboard |

### Manual Backup Process

```bash
# Export script (run weekly or before major changes)
pg_dump "$DATABASE_URL" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file="backup-$(date +%Y%m%d).dump"
```

### Backup Storage

| Backup Type | Storage Location | Retention |
|-------------|------------------|-----------|
| Supabase automated | Supabase infrastructure | 7 days |
| Manual pg_dump | Local + cloud storage (S3, GCS, etc.) | 90 days |
| Pre-migration | Local before any schema change | Until verified |

### Backup Schedule

| Event | Action |
|-------|--------|
| Daily | Supabase automated backup (automatic) |
| Weekly | Manual pg_dump export |
| Before migration | Manual pg_dump export |
| Monthly | Verify backup restore works (test restore) |

### Restore Process

1. **From Supabase backup:** Dashboard → Database → Backups → Restore
2. **From pg_dump:** `pg_restore --dbname="$DATABASE_URL" backup.dump`

---

## Environment Configuration

### Environment Files

| File | Purpose | Git Status |
|------|---------|------------|
| `.env.example` | Template with placeholder values | Committed |
| `.env` | Real values for development/production | Ignored |

### .env.example

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration
VITE_APP_URL=https://avdesigner.app
```

### Developer Setup

1. Clone repo
2. Copy `.env.example` to `.env`
3. Fill in real Supabase credentials (shared via secure channel)
4. Run `npm install` and `npm run dev`

### Usage in Code

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Type Safety

```typescript
// src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_URL: string;
}
```

---

## Schema Deployment Process

### Supabase CLI Setup

```bash
# Install CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project (one-time)
supabase link --project-ref your-project-ref
```

### Migration Workflow

```
1. Create migration locally
   └── supabase migration new <name>
   └── Edit: supabase/migrations/YYYYMMDDHHMMSS_<name>.sql

2. Test migration
   └── Review SQL manually (no local DB)

3. Backup production
   └── pg_dump before risky changes

4. Apply to production
   └── supabase db push

5. Verify
   └── Check Supabase Dashboard
   └── Test affected features in app

6. Commit migration file
   └── git add supabase/migrations/
   └── git commit -m "feat: add <description>"
```

### Migration File Structure

```
supabase/
├── config.toml              # Project configuration
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_authentication.sql    # From auth design
    └── XXX_<description>.sql     # Future migrations
```

### Commands Reference

| Command | Purpose |
|---------|---------|
| `supabase migration new name` | Create new migration file |
| `supabase db push` | Apply pending migrations to linked project |
| `supabase db diff` | Generate migration from remote schema changes |
| `supabase db reset` | Reset database (dangerous - avoid in prod) |

### Safety Checklist (Before Push)

- [ ] Backup taken if schema is destructive
- [ ] Migration SQL reviewed for errors
- [ ] No `DROP` without confirmation
- [ ] RLS policies included for new tables
- [ ] Indexes added for new foreign keys

---

## App Distribution & Auto-Updates

### Tauri Updater Configuration

```json
// src-tauri/tauri.conf.json
{
  "plugins": {
    "updater": {
      "active": true,
      "dialog": true,
      "endpoints": [
        "https://github.com/your-org/av-designer/releases/latest/download/latest.json"
      ],
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

### Update Flow

1. App starts → checks GitHub for `latest.json`
2. If newer version exists → prompt user
3. User accepts → download + verify signature
4. Install → restart app

### Release Artifacts

| Platform | File | Description |
|----------|------|-------------|
| macOS | `AV-Designer_x.x.x_universal.dmg` | Universal binary (Intel + Apple Silicon) |
| macOS | `AV-Designer.app.tar.gz` | Compressed app for updater |
| Windows | `AV-Designer_x.x.x_x64-setup.exe` | NSIS installer |
| Windows | `AV-Designer_x.x.x_x64_en-US.msi` | MSI installer |
| Both | `latest.json` | Version manifest for updater |

### latest.json Structure

```json
{
  "version": "1.0.0",
  "notes": "Release notes here",
  "pub_date": "2026-01-18T00:00:00Z",
  "platforms": {
    "darwin-universal": {
      "signature": "SIGNATURE_HERE",
      "url": "https://github.com/.../AV-Designer.app.tar.gz"
    },
    "windows-x86_64": {
      "signature": "SIGNATURE_HERE",
      "url": "https://github.com/.../AV-Designer_x.x.x_x64-setup.nsis.zip"
    }
  }
}
```

### Release Process

1. Update version in `package.json` and `tauri.conf.json`
2. Build for all platforms
3. Sign artifacts (Tauri signing + code signing)
4. Create GitHub Release with tag
5. Upload artifacts + `latest.json`
6. Users receive update notification

---

## Code Signing

### Two Types of Signing

**1. Tauri Update Signing** - Signs update bundles for auto-updater verification

```bash
# Generate key pair (one-time)
npx tauri signer generate -w ~/.tauri/av-designer.key

# Build with signing
TAURI_SIGNING_PRIVATE_KEY="contents-of-key-file" npm run tauri build
```

**2. OS Code Signing** - Tells OS the app is from verified developer

### macOS Signing

**Setup Steps:**
1. Enroll in Apple Developer Program at developer.apple.com
2. Create "Developer ID Application" certificate in Certificates portal
3. Download and install in Keychain Access
4. Create app-specific password for notarization (appleid.apple.com)
5. Note your Team ID (shown in membership details)

**Environment Variables:**
```bash
APPLE_ID=your@email.com
APPLE_PASSWORD=app-specific-password
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_SIGNING_IDENTITY="Developer ID Application: Your Company (TEAM_ID)"
```

**Tauri Config:**
```json
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Your Company (TEAM_ID)",
      "hardenedRuntime": true,
      "entitlements": "Entitlements.plist"
    }
  }
}
```

**Entitlements.plist:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.network.client</key>
  <true/>
  <key>com.apple.security.files.user-selected.read-write</key>
  <true/>
</dict>
</plist>
```

### Windows Signing

**Setup Steps:**
1. Purchase OV code signing certificate from CA (DigiCert, Sectigo, SSL.com)
2. Complete identity verification (business documents required)
3. Receive certificate file (.pfx)
4. Extract thumbprint for Tauri config

**Tauri Config:**
```json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

### Pre-Certificate Development

Before obtaining certificates, you can still build and test:
- **macOS:** Unsigned builds work on your own machine (right-click → Open)
- **Windows:** Unsigned builds work with SmartScreen bypass

Certificates are a **release blocker** - required before distributing to users.

---

## Monitoring

Using Supabase Dashboard only:
- Database metrics (connections, queries, storage)
- Auth metrics (signups, logins, failures)
- Storage metrics (bandwidth, objects)
- API metrics (requests, latency)

Future enhancement: Add external monitoring (Datadog, uptime checks) if needed.

---

## Checklist: First Deployment

### One-Time Setup

- [ ] Supabase project linked (`supabase link`)
- [ ] Auth providers configured (Email, Microsoft, Google)
- [ ] JWT settings configured
- [ ] Rate limiting configured
- [ ] `public-assets` bucket created
- [ ] Storage policies applied
- [ ] Edge Function for org bucket creation deployed
- [ ] `.env` file created from `.env.example`

### Before First Release

- [ ] Apple Developer Program enrolled
- [ ] macOS certificate created and installed
- [ ] Windows OV certificate purchased and received
- [ ] Tauri signing key generated
- [ ] GitHub repo configured for releases

### Each Release

- [ ] Version bumped in `package.json` and `tauri.conf.json`
- [ ] Changelog updated
- [ ] Build completed for macOS and Windows
- [ ] Artifacts signed (Tauri + code signing)
- [ ] GitHub Release created with artifacts
- [ ] `latest.json` uploaded
- [ ] Verify auto-update works

---

## File Changes Required

```
av_designer/
├── .env.example                    # Add Supabase vars
├── src/
│   ├── lib/
│   │   └── supabase.ts            # Update to use env vars
│   └── vite-env.d.ts              # Add type definitions
├── src-tauri/
│   ├── tauri.conf.json            # Add updater + signing config
│   └── Entitlements.plist         # New: macOS entitlements
└── supabase/
    ├── config.toml                # Link to production project
    └── functions/
        └── create-org-bucket/     # New: Edge Function
            └── index.ts
```
