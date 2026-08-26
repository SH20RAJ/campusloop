export interface CampusSticker {
  id: string;
  name: string;
  category: "campus" | "exams" | "coding" | "reactions" | "fest";
  url: string;
  emoji?: string;
}

export interface StickerCategory {
  id: string;
  name: string;
  icon: string;
}

export const STICKER_CATEGORIES: StickerCategory[] = [
  { id: "all", name: "All Stickers", icon: "🔥" },
  { id: "campus", name: "Campus Tea", icon: "☕" },
  { id: "exams", name: "Exam Stress", icon: "📚" },
  { id: "coding", name: "Dev & Hustle", icon: "💻" },
  { id: "reactions", name: "Reactions", icon: "🔥" },
  { id: "fest", name: "Fest & Chill", icon: "🎧" },
];

export const CAMPUS_STICKERS: CampusSticker[] = [
  // ─── Campus Tea & Hostel Life ───
  {
    id: "chai_sutta",
    name: "Chai Break",
    category: "campus",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2k3eDFsMHRndmJ1Z3h6dG9oNW5pMm9qZ3RwbXZiYjR4Y2Z6dnZzYSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/Wq8F6fG7D2P1S/giphy.gif",
    emoji: "☕",
  },
  {
    id: "tea_spilled",
    name: "Spill The Tea",
    category: "campus",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHk5a2l4bHhqa2U0bmd2Nm52anB2b2J3ZmJ0Z2lqa2xydjY4bXZoZCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/l0HlSi3AIOM3fAhX2/giphy.gif",
    emoji: "👀",
  },
  {
    id: "maggi_hostel",
    name: "2 AM Maggi",
    category: "campus",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2Rqb2Nwd3N3dWN0YTVhYXZqZmptZ3ptZ21rZ3B4Y21ndm9vdmpnYSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3o7TKSjRrfIPjeiVyM/giphy.gif",
    emoji: "🍜",
  },
  {
    id: "dil_toot_gaya",
    name: "Heartbroken",
    category: "campus",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmZ1ZXo2a2V3eGpnZXZvM25paXphNG52ZzZicnJka3o1Z3ZqN2pmaSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/OPU6wzx8JrHna/giphy.gif",
    emoji: "💔",
  },
  {
    id: "attendance_75",
    name: "75% Attendance Run",
    category: "campus",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnY2M3A5ZGZ3YXZ3Z2ppNm54ZnZpbHR2dnB3OHBpd2xraXZ6N21jZiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3o7btPCcdNniyf0ArS/giphy.gif",
    emoji: "🏃",
  },
  {
    id: "crush_alert",
    name: "Crush Spotted",
    category: "campus",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc29lOG50NnhmNHB0bDJ3dGdzaDVndG10enZ2M2lsd2h2bHVudjE2OSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/26FLdmIp6wJr91JAI/giphy.gif",
    emoji: "😍",
  },

  // ─── Exams & Study Panic ───
  {
    id: "padhai_nahi_ho_rahi",
    name: "Dead / Brain Fry",
    category: "exams",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaG13a2RucmppYjBpdnZ1ZXh1cml3OG51NXF1Z3Rva3V1Y3Yxa3o5dCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/26BRzozg4TCBXv6QU/giphy.gif",
    emoji: "💀",
  },
  {
    id: "all_nighter",
    name: "All Nighter Mode",
    category: "exams",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2x0aDJyZ3Z0ZXZ4YjV1bWN6aXkwdGdrbHR0a3I3ZnFkYnFzaHJhNiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/l2YWgBNbJ20A4yq6A/giphy.gif",
    emoji: "⚡",
  },
  {
    id: "pakka_pass",
    name: "Pakka 10 CGPA",
    category: "exams",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnlydG5wZTFhM2pmYmt0Z3V6NDlxcHBxZ2h0ODVrcTlkMnBxYWdiciZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3oz8xAFtqoOUUrsh7W/giphy.gif",
    emoji: "💯",
  },
  {
    id: "exam_cry",
    name: "Paper Was Tough",
    category: "exams",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExazdvOG5qM3ZqMndwaHptZ25ndnhocmN5M2l4aG55OHFpZ2RsaWRrMiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/d2lcHJTG5Tscg/giphy.gif",
    emoji: "😭",
  },
  {
    id: "mind_blown",
    name: "Syllabus Shock",
    category: "exams",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnlqMGdxcWFoaGlhNDN6Z25vN210cXRucXpvdXZ0a3Uwb3Q4Z3phYyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/26ufdipQqU2lhNA4g/giphy.gif",
    emoji: "🤯",
  },

  // ─── Dev, Coding & Placements ───
  {
    id: "goat_coder",
    name: "Dev Manush (G.O.A.T)",
    category: "coding",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWVnd3JpZTRvd2p1aW56dTRvcm16ZXZ1bGdxdmVpd3F5eGhpN3FodyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/TNb3Ihss7kKZq/giphy.gif",
    emoji: "🐐",
  },
  {
    id: "hackathon_grind",
    name: "Hackathon Hustle",
    category: "coding",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTVxYTNocmtvaGppanBqNG54dzE4bDV6Nm41dXkyZXB0M3pldzIyaiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3oKIPnAiaMCws8nOsE/giphy.gif",
    emoji: "💻",
  },
  {
    id: "bug_fixed",
    name: "It Works on Localhost",
    category: "coding",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXVrdzN0Y3FqdzBwM3FxdnJxbzVydnRtaHpxbHdvM3lzYnBvYnA2MiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/ule4akeMxydYk/giphy.gif",
    emoji: "🚀",
  },
  {
    id: "placement_offer",
    name: "Offer Letter Grabbed",
    category: "coding",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2R4bXV2N2pqcnRxd3J2OXAwMHB6dW16eW10bnA4dWpsdGNqMHpyNyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/l0MYt5jPR6QX5pnqM/giphy.gif",
    emoji: "💰",
  },

  // ─── Reactions & Memes ───
  {
    id: "fire_lit",
    name: "That's Lit",
    category: "reactions",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHExdWN1ZnB1aGxtYnB0OXNrbDdpMmxvaGplMGpqeHV5NWlyMm92NiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3o72F8t9TDi2xVnxOE/giphy.gif",
    emoji: "🔥",
  },
  {
    id: "salute_respect",
    name: "Respect / Salute",
    category: "reactions",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHJrMnN2NmprOHhuc25zZWhpM25qMHh2azdpZWF3Z3drbWVrcWZ1dyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3osxYrgM8gi9CDjcPu/giphy.gif",
    emoji: "🫡",
  },
  {
    id: "clapping_applause",
    name: "Standing Ovation",
    category: "reactions",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3h2OG00OXNuaWhzbGZvaGtpZmdxMnJtMGhka3VwazltaXRidnpobCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/l3q2XhfQ8oCkm1GhO/giphy.gif",
    emoji: "👏",
  },
  {
    id: "sus_look",
    name: "Suspicious / Sus",
    category: "reactions",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWkzb2dpdnExYWFwMTFrc3B5eTZubDdrYmxoYWF1M2s0aGNjY3BscyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3gNotAoIRZsb9UHPnj/giphy.gif",
    emoji: "🤨",
  },

  // ─── Fest & Chill ───
  {
    id: "party_popper",
    name: "Fest Season Vibe",
    category: "fest",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWZqcTdvb2s2MnIyaGNldWtpOGd1d293dDFwb242MmsxYnBxOHR3NyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/26tPplGWjN0xLybiU/giphy.gif",
    emoji: "🎉",
  },
  {
    id: "dj_night",
    name: "DJ Night Banger",
    category: "fest",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjYxbWdvNDdrNXFmaXBqdWV2NHNvZmluNnFjNXc5ZGFwN2MzbzFpbiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/l41lI4bYmcsPJX9Go/giphy.gif",
    emoji: "🎧",
  },
];
