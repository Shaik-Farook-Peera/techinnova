# Supabase SQL Migration Guide

## How to Run the Migration in Supabase

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project: https://app.supabase.com/
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Add the New Columns

Copy and paste this SQL query:

```sql
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS team_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS team_leader_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS team_leader_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS problem_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS track VARCHAR(100);
```

**Run** the query (Ctrl+Enter or click Run button)

**Expected output:** `Success` with message about columns added

---

### Step 3: Backfill the Existing Data

Copy and paste this SQL query:

```sql
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
```

**Run** the query

**Expected output:** `Success` with message like "5 rows updated"

---

### Step 4: Verify the Data

Copy and paste this SQL query to check if it worked:

```sql
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
```

**Run** the query

You should see a table with all the new columns populated. Example:

| name | email | team_name | team_leader_name | problem_id | track | is_leader |
|------|-------|-----------|------------------|-----------|-------|-----------|
| new | new5@gmail.com | NEW | new | HT-01 | HealthTech | true |
| new | new6@gmail.com | NEW | new | HT-01 | HealthTech | false |
| hgb | mrh08580@gmail.com | CWD | hgb | OI-002 | Open Innovation | true |

---

### Step 5: Check for Any Missing Data (Optional)

If some fields are NULL, run this to find orphaned records:

```sql
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
```

---

## What the Migration Does

| Column | Source | Purpose |
|--------|--------|---------|
| `team_name` | From teams table | Quick access to team name without join |
| `team_leader_email` | From teams.lead_email | Know who leads each team |
| `team_leader_name` | From participants (is_leader=true) | Display leader name easily |
| `problem_id` | From teams table | Know which problem/track assigned |
| `track` | From teams table | Know track (Agriculture, HealthTech, etc.) |

---

## After Migration

✅ **Queries are now much faster** - No need to join participants + teams
✅ **Admin dashboard works** - `/admin/participants` page
✅ **New registrations auto-populate** - Code already updated
✅ **Easy reporting** - Single table query shows complete info

---

## If Something Goes Wrong

### Rollback (Delete the columns):

```sql
ALTER TABLE participants
DROP COLUMN IF EXISTS team_name,
DROP COLUMN IF EXISTS team_leader_email,
DROP COLUMN IF EXISTS team_leader_name,
DROP COLUMN IF EXISTS problem_id,
DROP COLUMN IF EXISTS track;
```

---

## Test After Migration

**Visit:** `https://techinnova-2k26.vercel.app/admin/participants`

You should see all participants grouped by team with all team information populated!
