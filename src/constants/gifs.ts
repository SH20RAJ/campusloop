export interface GifPopularTag {
  id: string;
  label: string;
  query: string;
}

export const GIF_POPULAR_TAGS: GifPopularTag[] = [
  { id: "trending", label: "🔥 Trending", query: "" },
  { id: "tea", label: "☕ Campus Tea", query: "spilling tea drama" },
  { id: "exam", label: "📚 Exam Mood", query: "exam studying stressed" },
  { id: "lol", label: "😂 Dead LOL", query: "laughing meme" },
  { id: "shocked", label: "😱 Shocked", query: "shocked reaction" },
  { id: "party", label: "🎉 Fest Vibe", query: "college party dance" },
  { id: "crush", label: "💘 Crush", query: "crush flirt romantic" },
  { id: "tired", label: "😴 8 AM Class", query: "tired sleepy morning" },
  { id: "agree", label: "💯 Facts", query: "agree yes nod facts" },
];

export const GIF_FALLBACK_QUERY = "college meme reaction";
export const DEFAULT_GIF_PAGE_LIMIT = 24;
