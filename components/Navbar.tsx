import NavbarClient from "@/components/NavbarClient";
import { createClient } from "@/utils/supabase/server";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "admin" | "player" | "organizer" | undefined;
  let username: string | null | undefined;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, username")
      .eq("id", user.id)
      .single();

    role = profile?.role ?? undefined;
    username = profile?.username ?? null;
  }

  return <NavbarClient isAuthenticated={!!user} role={role} username={username} />;
}
