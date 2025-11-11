# Old Database Files

This directory contains the original database files that have been replaced by the streamlined database structure.

## What Happened

The database structure was consolidated from multiple files into two comprehensive files:
- **hospital-database.sql** - Single comprehensive schema file
- **hospital-seed.sql** - Single comprehensive seed data file

## Files in This Directory

### Original Schema Files
- **supabase-schema.sql** - Original database schema
- **supabase-role-trigger.sql** - User role assignment trigger
- **supabase-migration-add-patient-care-type.sql** - Migration for patient_care_type column

### Original Seed Files
- **supabase-seed-level1-hospital.sql** - Original seed data
- **supabase-seed-level1-hospital-safe.sql** - Safe version with ON CONFLICT clauses

### Scripts
- **enable-staff-insert-policy.sql** - Development policy for staff inserts

### Documentation
- **DATABASE_SETUP_GUIDE.md** - Original setup guide (replaced by DATABASE_SETUP.md)

## New Structure

All functionality from these files has been consolidated into:
- **hospital-database.sql** - Complete schema with triggers and policies
- **hospital-seed.sql** - Complete seed data with safe ON CONFLICT clauses
- **DATABASE_MODEL.md** - Comprehensive data model documentation
- **DATABASE_SETUP.md** - Updated setup instructions

## Why This Change?

**Benefits:**
1. **Simpler setup** - Run 2 files instead of 5+
2. **Single source of truth** - One schema file, one seed file
3. **Better documentation** - Comprehensive data model guide
4. **Easier maintenance** - All related code in one place
5. **No migration issues** - Everything included in main schema

## Can I Delete These Files?

These files are kept as backup and reference. You can safely delete this directory if:
- You've successfully set up the new database structure
- You've verified everything works
- You don't need historical reference

## Restoration

If you need to restore these files for any reason, they are preserved here unchanged from their original state.

---

**Date Archived:** 2025
**Reason:** Database structure consolidation
