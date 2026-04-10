export const TOURNAMENTS = [
  {
    id: "1",
    game: "VALORANT",
    title: "Challengers Series: EMEA",
    prizePool: "$25,000",
    status: "Live",
    banner: "https://images.unsplash.com/photo-1614050306723-3230dee622c0?auto=format&fit=crop&q=80&w=1200",
    description: "The premier Valorant tournament for the EMEA region. Only the best teams will survive.",
    sponsors: ["SPONSOR A", "BRAND B", "GLOBAL X"],
    stats: {
      participants: 32,
      viewers: "12,402",
      round: "Quarter-Finals",
    },
    standings: [
      { rank: 1, team: "Global Elite", played: 5, won: 5, lost: 0, points: 15, trend: "up" },
      { rank: 2, team: "Cyber Phantoms", played: 5, won: 4, lost: 1, points: 12, trend: "up" },
      { rank: 3, team: "Shadow Strikers", played: 5, won: 3, lost: 2, points: 9, trend: "down" },
      { rank: 4, team: "Neon Hunters", played: 5, won: 2, lost: 3, points: 6, trend: "constant" },
      { rank: 5, team: "Arctic Wolves", played: 5, won: 1, lost: 4, points: 3, trend: "down" },
    ]
  },
  // Add more as needed
];
