import { supabase } from "./supabase";

/**
 * Migration: Add denormalized columns to participants table
 * These columns make it easy to query team info without joining tables
 */
export const migrateParticipantsTable = async () => {
  try {
    console.log("Starting participants table migration...");

    // Step 1: Fetch all participants with their team info
    const { data: participants, error: fetchError } = await supabase
      .from("participants")
      .select("id, team_id");

    if (fetchError) {
      console.error("Error fetching participants:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!participants || participants.length === 0) {
      console.log("No participants to migrate");
      return { success: true, message: "No participants to migrate" };
    }

    // Step 2: For each participant, fetch their team info
    const updates = [];

    for (const participant of participants) {
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("team_name, lead_email, problem_id, track")
        .eq("id", participant.team_id)
        .single();

      if (teamError || !team) {
        console.warn(
          `Could not find team for participant ${participant.id}:`,
          teamError
        );
        continue;
      }

      // Get lead name from participants table
      const { data: leader } = await supabase
        .from("participants")
        .select("name")
        .eq("email", team.lead_email)
        .eq("team_id", participant.team_id)
        .single();

      updates.push({
        id: participant.id,
        team_name: team.team_name,
        team_leader_email: team.lead_email,
        team_leader_name: leader?.name || "Unknown",
        problem_id: team.problem_id,
        track: team.track,
      });
    }

    // Step 3: Batch update participants
    const { error: updateError } = await supabase
      .from("participants")
      .upsert(updates, { onConflict: "id" });

    if (updateError) {
      console.error("Error updating participants:", updateError);
      return { success: false, error: updateError.message };
    }

    console.log(`Successfully migrated ${updates.length} participants`);
    return {
      success: true,
      message: `Migrated ${updates.length} participants`,
    };
  } catch (error: any) {
    console.error("Migration failed:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Quick fix: Update a single participant's team info when team is created/updated
 */
export const updateParticipantTeamInfo = async (
  teamId: string,
  participantEmails: string[]
) => {
  try {
    // Get team info
    const { data: team } = await supabase
      .from("teams")
      .select("team_name, lead_email, problem_id, track")
      .eq("id", teamId)
      .single();

    if (!team) {
      console.error("Team not found:", teamId);
      return { success: false, error: "Team not found" };
    }

    // Get lead name
    const { data: leader } = await supabase
      .from("participants")
      .select("name")
      .eq("email", team.lead_email)
      .single();

    // Update all participants in this team
    const { error } = await supabase
      .from("participants")
      .update({
        team_name: team.team_name,
        team_leader_email: team.lead_email,
        team_leader_name: leader?.name || "Unknown",
        problem_id: team.problem_id,
        track: team.track,
      })
      .in("email", participantEmails);

    if (error) {
      console.error("Error updating participant team info:", error);
      return { success: false, error: error.message };
    }

    return { success: true, message: "Updated participants with team info" };
  } catch (error: any) {
    console.error("Update failed:", error);
    return { success: false, error: error.message };
  }
};
