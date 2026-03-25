-- ============================================================================
-- TECHINNOVA 2026 - Participants Table Migration
-- Add denormalized columns to participants table for easier querying
-- ============================================================================

-- Step 1: ADD NEW COLUMNS TO PARTICIPANTS TABLE
-- Run this first in Supabase SQL Editor
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS team_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS team_leader_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS team_leader_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS problem_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS track VARCHAR(100);

-- ============================================================================
-- Step 2: BACKFILL EXISTING DATA
-- This query joins participants with teams to populate the new columns
-- ============================================================================

UPDATE participants p
SET 
  team_name = t.team_name,
  team_leader_email = t.lead_email,
  problem_id = t.problem_id,
  track = t.track,
  team_leader_name = pl.name
FROM teams t
LEFT JOIN participants pl ON pl.team_id = t.id AND pl.is_leader = true
WHERE p.team_id = t.id;

-- ============================================================================
-- Step 3: VERIFY THE DATA WAS POPULATED
-- Run this to check if the backfill worked correctly
-- ============================================================================

SELECT 
  id,
  name,
  email,
  team_name,
  team_leader_name,
  team_leader_email,
  problem_id,
  track,
  is_leader
FROM participants
ORDER BY team_name, is_leader DESC
LIMIT 20;

-- ============================================================================
-- OPTIONAL: If you need to check for any NULL values after migration
-- ============================================================================

SELECT 
  COUNT(*) as total_participants,
  COUNT(team_name) as with_team_name,
  COUNT(team_leader_name) as with_leader_name,
  COUNT(problem_id) as with_problem_id,
  COUNT(track) as with_track
FROM participants;

-- ============================================================================
-- OPTIONAL: Check participants without team info (in case of orphaned records)
-- ============================================================================

SELECT 
  p.id,
  p.name,
  p.email,
  p.team_id,
  p.team_name,
  p.problem_id,
  p.track
FROM participants p
WHERE p.team_id IS NOT NULL 
  AND (p.team_name IS NULL OR p.track IS NULL)
ORDER BY p.team_id;
