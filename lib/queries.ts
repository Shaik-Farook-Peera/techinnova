import { supabase } from "./supabase";

/**
 * Query helper: Get all participants with their complete team information
 * Easy way to see which member belongs to which team
 */
export const getParticipantsWithTeamInfo = async () => {
  try {
    const { data, error } = await supabase
      .from("participants")
      .select(
        `
        id,
        name,
        email,
        branch,
        section,
        year,
        reg_number,
        phone,
        is_leader,
        team_id,
        team_name,
        team_leader_name,
        team_leader_email,
        problem_id,
        track
      `
      )
      .order("team_name", { ascending: true })
      .order("is_leader", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching participants with team info:", error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [], error: null };
  } catch (error: any) {
    console.error("Query failed:", error);
    return { success: false, data: [], error: error.message };
  }
};

/**
 * Get participants grouped by team
 * Returns object like: { "Team A": [...members], "Team B": [...members] }
 */
export const getParticipantsGroupedByTeam = async () => {
  try {
    const { data, error } = await supabase
      .from("participants")
      .select(
        `
        id,
        name,
        email,
        branch,
        section,
        year,
        reg_number,
        phone,
        is_leader,
        team_id,
        team_name,
        team_leader_name,
        problem_id,
        track
      `
      )
      .order("team_name", { ascending: true })
      .order("is_leader", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching participants:", error);
      return { success: false, data: {}, error: error.message };
    }

    // Group by team_name
    const grouped = (data || []).reduce(
      (acc, participant) => {
        const teamName = participant.team_name || "No Team";
        if (!acc[teamName]) {
          acc[teamName] = [];
        }
        acc[teamName].push(participant);
        return acc;
      },
      {} as Record<string, any[]>
    );

    return { success: true, data: grouped, error: null };
  } catch (error: any) {
    console.error("Query failed:", error);
    return { success: false, data: {}, error: error.message };
  }
};

/**
 * Get team statistics
 * Returns: total teams, total participants, participants per team
 */
export const getTeamStatistics = async () => {
  try {
    // Get all participants
    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select("team_id, team_name");

    if (participantsError) {
      throw participantsError;
    }

    // Get all teams
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, team_name, track");

    if (teamsError) {
      throw teamsError;
    }

    const totalTeams = teams?.length || 0;
    const totalParticipants = participants?.length || 0;

    // Group participants by team
    const teamCounts = (participants || []).reduce(
      (acc, p) => {
        const teamName = p.team_name || "Unknown";
        acc[teamName] = (acc[teamName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Track breakdown
    const trackBreakdown = (teams || []).reduce(
      (acc, t) => {
        const track = t.track || "Unknown";
        acc[track] = (acc[track] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      success: true,
      data: {
        totalTeams,
        totalParticipants,
        averageTeamSize:
          totalTeams > 0 ? (totalParticipants / totalTeams).toFixed(2) : 0,
        teamCounts,
        trackBreakdown,
      },
      error: null,
    };
  } catch (error: any) {
    console.error("Statistics query failed:", error);
    return { success: false, data: {}, error: error.message };
  }
};
