export const GENDER_OPTIONS = [
  { id: "MALE", label: "Guy / Male" },
  { id: "FEMALE", label: "Girl / Female" },
  { id: "NON_BINARY", label: "Non-binary" },
  { id: "OTHER", label: "Other / Prefer not to say" },
] as const;

export const DATING_INTEREST_TAGS = [
  "Coding & Hackathons",
  "Campus Tea & Gossips",
  "Gym & Fitness",
  "Anime & Manga",
  "Hostel Nightouts",
  "Cafes & Canteen",
  "Indie & Rock Music",
  "Photography & Film",
  "Travel & Road Trips",
  "Gaming & Valorant",
  "Startup & VC",
  "Literature & Poetry",
  "Dance & Choreography",
  "Cricket & Football",
] as const;

export const DATING_PROMPT_TEMPLATES = [
  "My ideal weekend on campus looks like...",
  "The quickest way to my heart is canteen...",
  "Unpopular campus opinion I will defend to death...",
  "Two truths and one college lie...",
  "Best spot on our campus to hang out is...",
] as const;

export const COMPATIBILITY_SCORING = {
  BASELINE: 35,
  MAX_SCORE: 99,
  SHARED_INTEREST_WEIGHT: 12,
  SAME_CAMPUS_BOOST: 15,
  SAME_STATE_BOOST: 6,
  SAME_COURSE_BOOST: 8,
  YEAR_PROXIMITY_BOOST: 5,
  LIKED_YOU_BOOST: 10,
} as const;
