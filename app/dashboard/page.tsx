import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardRootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Redirect based on role instead of embedding directly
  // This allows keeping separation of concerns.
  if (profile?.role === "organizer") {
    redirect("/dashboard/organizer");
  } else if (profile?.role === "admin") {
    redirect("/dashboard/admin");
  } else {
    // Default fallback or player dashboard
    redirect("/dashboard/player");
  }
}
