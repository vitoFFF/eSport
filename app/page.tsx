import Hero from "@/components/Hero";
import FeaturedTournaments from "@/components/FeaturedTournaments";
import Features from "@/components/Features";
import AIChat from "@/components/AIChat";
import HomeSections from "./HomeSections";

import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: dbTournaments } = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      <FeaturedTournaments dbTournaments={dbTournaments || []} />

      <HomeSections />

      <Features />

      <AIChat />
    </div>
  );
}
