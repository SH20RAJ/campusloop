/**
 * CampusLoop Official Social Links & Channels
 * Priority Order: Instagram -> LinkedIn -> X (Twitter)
 */

export const SOCIAL_LINKS = {
  instagram: {
    name: "Instagram",
    handle: "@campusloop.space",
    url: "https://www.instagram.com/campusloop.space/",
  },
  linkedin: {
    name: "LinkedIn",
    handle: "CampusLoop",
    url: "https://www.linkedin.com/company/mycampusloop/?viewAsMember=true",
  },
  x: {
    name: "X (Twitter)",
    handle: "@mycampusloop",
    url: "https://x.com/company/mycampusloop/",
  },
} as const;

export const SOCIAL_MEDIA_ITEMS = [
  {
    id: "instagram",
    name: "Instagram",
    handle: "@campusloop.space",
    url: SOCIAL_LINKS.instagram.url,
    label: "Follow on Instagram",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "CampusLoop",
    url: SOCIAL_LINKS.linkedin.url,
    label: "Connect on LinkedIn",
  },
  {
    id: "x",
    name: "X",
    handle: "@mycampusloop",
    url: SOCIAL_LINKS.x.url,
    label: "Follow on X",
  },
] as const;
