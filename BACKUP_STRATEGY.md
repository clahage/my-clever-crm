<!-- DO NOT DELETE - MASTER REFERENCE FOR ALL AI COLLABORATORS -->

# BACKUP STRATEGY

## NAMING CONVENTION
- Backups named as: `backup-YYYYMMDD-HHMMSS-[scope].zip`
- Example: `backup-20250910-133000-full.zip`

## INTERVALS
- Daily incremental backup (code, config, DB rules)
- Weekly full backup (entire project root, all modules, DB exports)
- Pre/post major feature restoration or migration

**Source:** Enterprise backup, backup SOP (2025-09-10)
