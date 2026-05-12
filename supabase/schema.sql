-- Drop existing tables to ensure clean migration (Note: This wipes local test data)
DROP TABLE IF EXISTS public.rankings,
public.media,
public.matches,
public.tournament_registrations,
public.tournaments,
public.team_members,
public.teams,
public.organizations,
public.profiles CASCADE;

-- Custom ENUM for user roles
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'player', 'manager', 'organizer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'manager';

-- Create a profiles table


CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  role public.user_role DEFAULT 'player',
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  games TEXT[], -- Array of games the player plays
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Organizations table
CREATE TABLE public.organizations (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES public.profiles (id) ON DELETE CASCADE,
    avatar_url TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE public.teams (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    name TEXT NOT NULL,
    organization_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE,
    avatar_url TEXT,
    category TEXT NOT NULL, -- e.g., 'football', 'tennis', 'padel', 'esport'
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Team members / invitations
CREATE TABLE public.team_members (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    team_id UUID REFERENCES public.teams (id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles (id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, joined
    joined_at TIMESTAMP
    WITH
        TIME ZONE,
        UNIQUE (team_id, user_id)
);

-- Tournaments table
CREATE TABLE public.tournaments (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    rules TEXT,
    prize_pool TEXT,
    organizer_id UUID REFERENCES public.profiles (id) ON DELETE CASCADE,
    banner_url TEXT,
    status TEXT DEFAULT 'upcoming', -- upcoming, open, ongoing, completed
    category TEXT DEFAULT 'esport', -- 'football', 'tennis', 'padel', 'esport'
    participation_mode TEXT DEFAULT 'team', -- '1v1', 'team'
    max_roster_size INTEGER,
    bracket_structure TEXT DEFAULT 'single_elimination', -- 'single_elimination', 'double_elimination', 'round_robin', etc.
    seeding_method TEXT DEFAULT 'random', -- 'random', 'rank', 'manual'
    third_place_match BOOLEAN DEFAULT false,
    point_policy JSONB DEFAULT '{}', -- Custom points for rankings
    settings JSONB DEFAULT '{}', -- colors, fonts, layout, stage_participants_count
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Tournament registrations
CREATE TABLE public.tournament_registrations (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments (id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams (id) ON DELETE SET NULL,
    status TEXT DEFAULT 'registered',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE public.matches (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments (id) ON DELETE CASCADE,
    home_team_id UUID REFERENCES public.teams (id) ON DELETE SET NULL,
    away_team_id UUID REFERENCES public.teams (id) ON DELETE SET NULL,
    home_player_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
    away_player_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
    home_score INTEGER,
    away_score INTEGER,
    details JSONB DEFAULT '{}', -- E.g. sets for tennis, map scores for eSport
    status TEXT DEFAULT 'pending', -- 'pending', 'submitted', 'confirmed', 'disputed', 'finalized'
    bracket_round INTEGER,
    match_order INTEGER,
    winner_team_id UUID REFERENCES public.teams (id) ON DELETE SET NULL,
    winner_player_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Media gallery
CREATE TABLE public.media (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments (id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- photo, video
    url TEXT NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Rankings
CREATE TABLE public.rankings (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments (id) ON DELETE CASCADE,
    entity_name TEXT NOT NULL, -- name of player or team
    rank INTEGER NOT NULL,
    score TEXT,
    year INTEGER DEFAULT extract(
        year
        from now()
    ),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- Create policies (Basic open policies for development, should be tightened later)
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR
SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles FOR
INSERT
WITH
    CHECK (auth.uid () = id);

CREATE POLICY "Users can update own profile." ON public.profiles FOR
UPDATE USING (auth.uid () = id);

CREATE POLICY "Public organizations are viewable." ON public.organizations FOR
SELECT USING (true);

CREATE POLICY "Managers can insert their own organizations." ON public.organizations FOR
INSERT
WITH
    CHECK (auth.uid () = owner_id);

CREATE POLICY "Public teams are viewable by everyone." ON public.teams FOR
SELECT USING (true);
-- To allow managers to insert teams based on organization owner check, we might simplify for now: (Assuming they are managing it via API)
CREATE POLICY "Managers can insert their teams." ON public.teams FOR
INSERT
WITH
    CHECK (true);

CREATE POLICY "Team members are viewable by everyone." ON public.team_members FOR
SELECT USING (true);

CREATE POLICY "Managers can manage team members." ON public.team_members FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.teams
            JOIN public.organizations ON teams.organization_id = organizations.id
        WHERE
            teams.id = team_members.team_id
            AND organizations.owner_id = auth.uid ()
    )
);

CREATE POLICY "Users can manage their own membership." ON public.team_members FOR ALL USING (auth.uid () = user_id);

CREATE POLICY "Public tournaments are viewable by everyone." ON public.tournaments FOR
SELECT USING (true);

CREATE POLICY "Organizers can manage their own tournaments." ON public.tournaments FOR ALL USING (auth.uid () = organizer_id);

CREATE POLICY "Public matches are viewable by everyone." ON public.matches FOR
SELECT USING (true);

CREATE POLICY "Tournament registrations are viewable by everyone." ON public.tournament_registrations FOR
SELECT USING (true);

CREATE POLICY "Users can register themselves for tournaments." ON public.tournament_registrations FOR
INSERT
WITH
    CHECK (
        auth.uid () = player_id
        OR team_id IS NOT NULL
    );

CREATE POLICY "Users can cancel their own registrations." ON public.tournament_registrations FOR DELETE USING (
    auth.uid () = player_id
    OR EXISTS (
        SELECT 1
        FROM public.teams
            JOIN public.organizations ON teams.organization_id = organizations.id
        WHERE
            teams.id = tournament_registrations.team_id
            AND organizations.owner_id = auth.uid ()
    )
);

CREATE POLICY "Tournament organizers can insert matches." ON public.matches FOR
INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.tournaments
            WHERE
                tournaments.id = tournament_id
                AND tournaments.organizer_id = auth.uid ()
        )
    );

CREATE POLICY "Tournament organizers can delete matches." ON public.matches FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.tournaments
        WHERE
            tournaments.id = matches.tournament_id
            AND tournaments.organizer_id = auth.uid ()
    )
);

CREATE POLICY "Matches can be updated by tournament organizers." ON public.matches FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.tournaments
        WHERE
            tournaments.id = matches.tournament_id
            AND tournaments.organizer_id = auth.uid ()
    )
);

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, username)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'player'),
    new.raw_user_meta_data->>'username'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();