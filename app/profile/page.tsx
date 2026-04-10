import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, role, updated_at")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background px-4 pb-16 pt-40 md:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent-blue">Profile</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">Your Account</h1>

        <div className="mt-8 space-y-3">
          <ProfileRow label="Full name" value={profile?.full_name || "-"} />
          <ProfileRow label="Username" value={profile?.username || "-"} />
          <ProfileRow label="Role" value={profile?.role || "-"} />
          <ProfileRow label="Email" value={user.email || "-"} />
          <ProfileRow
            label="Updated"
            value={profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : "-"}
          />
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}
