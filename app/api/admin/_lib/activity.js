import { supabaseRestUrl, supabaseServiceHeaders } from "./supabase";

export async function logAdminActivity({ action, targetType, targetId, label }) {
  if (!action || !targetType) return;

  try {
    await fetch(`${supabaseRestUrl}/rest/v1/admin_activity_logs`, {
      method: "POST",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        action: String(action).slice(0, 80),
        target_type: String(targetType).slice(0, 80),
        target_id: targetId ? String(targetId).slice(0, 160) : null,
        label: label ? String(label).slice(0, 240) : null,
      }),
    });
  } catch (error) {
    console.warn("Admin activity could not be logged:", error);
  }
}
