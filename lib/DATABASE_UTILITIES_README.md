# Database Utilities for Participants

## Overview

Since participants table now has denormalized columns (`team_name`, `team_leader_name`, `problem_id`, `track`), it's much easier to query and display team information without complex joins.

## Columns Added to Participants Table

- `team_name` - Name of the team (denormalized from teams table)
- `team_leader_email` - Email of team leader
- `team_leader_name` - Name of team leader
- `problem_id` - Problem ID the team is solving
- `track` - Track name (Agriculture, HealthTech, etc.)

## Using the Utilities

### 1. Migration & Backfill

**File:** `lib/migrations.ts`

#### Migrate all existing participants:
```typescript
import { migrateParticipantsTable } from "@/lib/migrations";

const result = await migrateParticipantsTable();
if (result.success) {
  console.log(result.message);
}
```

#### Update a single team's participants:
```typescript
import { updateParticipantTeamInfo } from "@/lib/migrations";

const result = await updateParticipantTeamInfo(
  "team-id-here",
  ["email1@gmail.com", "email2@gmail.com"]
);
```

### 2. Query Functions

**File:** `lib/queries.ts`

#### Get all participants with team info:
```typescript
import { getParticipantsWithTeamInfo } from "@/lib/queries";

const result = await getParticipantsWithTeamInfo();
if (result.success) {
  const participants = result.data;
  // Each participant has: name, email, team_name, team_leader_name, track, etc.
}
```

#### Get participants grouped by team:
```typescript
import { getParticipantsGroupedByTeam } from "@/lib/queries";

const result = await getParticipantsGroupedByTeam();
if (result.success) {
  const grouped = result.data;
  // Returns: { "Team A": [...members], "Team B": [...members] }
}
```

#### Get team statistics:
```typescript
import { getTeamStatistics } from "@/lib/queries";

const result = await getTeamStatistics();
if (result.success) {
  const stats = result.data;
  // Returns: {
  //   totalTeams: 5,
  //   totalParticipants: 15,
  //   averageTeamSize: 3,
  //   teamCounts: { "Team A": 3, "Team B": 2 },
  //   trackBreakdown: { "Agriculture": 2, "HealthTech": 3 }
  // }
}
```

### 3. Admin Page

**URL:** `/admin/participants`

Shows all participants grouped by team with statistics:
- Total teams
- Total participants
- Average team size
- Track breakdown
- Detailed table of all members per team

## Registration Updates

When a team registers (either general or OI track), the participants are automatically saved with the new denormalized columns:

```typescript
// In registration pages, participants insert now includes:
{
  team_id: team.id,
  ...memberData,
  team_name: team.team_name,
  team_leader_email: team.lead_email,
  team_leader_name: processedMembers[0].name,
  problem_id: team.problem_id,
  track: team.track
}
```

## Migration Steps (For Existing Data)

1. **Add columns to participants table** (via Supabase UI):
   - `team_name` (text)
   - `team_leader_email` (text)
   - `team_leader_name` (text)
   - `problem_id` (text)
   - `track` (text)

2. **Run migration**:
   ```typescript
   import { migrateParticipantsTable } from "@/lib/migrations";
   const result = await migrateParticipantsTable();
   ```

3. **Verify** - Check admin page to see if data is populated correctly

## Benefits

✅ No need for complex table joins
✅ Faster queries
✅ Easy reporting and analytics
✅ Admin dashboard shows team composition instantly
✅ Single query to get complete participant info
