export interface CampusLocationGroup {
  groupName: string;
  locations: Array<{
    id: string;
    label: string;
    type: "BOYS_HOSTEL" | "GIRLS_HOSTEL" | "ACADEMIC" | "OTHER";
  }>;
}

export const BIT_MESRA_LOCATIONS: CampusLocationGroup[] = [
  {
    groupName: "Boys Hostels (H1 – H13)",
    locations: [
      { id: "h1_boys", label: "Hostel 1 (Boys)", type: "BOYS_HOSTEL" },
      { id: "h2_boys", label: "Hostel 2 (Boys)", type: "BOYS_HOSTEL" },
      { id: "h3_boys", label: "Hostel 3 (Boys)", type: "BOYS_HOSTEL" },
      { id: "h4_boys", label: "Hostel 4 (Boys)", type: "BOYS_HOSTEL" },
      { id: "h5_boys", label: "Hostel 5 (Boys)", type: "BOYS_HOSTEL" },
      { id: "h6_boys", label: "Hostel 6 (Boys)", type: "BOYS_HOSTEL" },
      { id: "h7_boys", label: "Hostel 7 (Boys)", type: "BOYS_HOSTEL" },
      { id: "h10_boys", label: "Hostel 10 (Boys)", type: "BOYS_HOSTEL" },
      { id: "h11_boys", label: "Hostel 11 (Boys)", type: "BOYS_HOSTEL" },
      { id: "h12_boys", label: "Hostel 12 (Boys)", type: "BOYS_HOSTEL" },
      { id: "h13_boys", label: "Hostel 13 (Boys)", type: "BOYS_HOSTEL" },
    ],
  },
  {
    groupName: "Girls Hostels (H8, H9, H15)",
    locations: [
      { id: "h8_girls", label: "Hostel 8 (Girls)", type: "GIRLS_HOSTEL" },
      { id: "h9_girls", label: "Hostel 9 (Girls)", type: "GIRLS_HOSTEL" },
      { id: "h15_girls", label: "Hostel 15 (Girls)", type: "GIRLS_HOSTEL" },
    ],
  },
  {
    groupName: "Academic & Campus Buildings",
    locations: [
      { id: "pmc_building", label: "PMC (Polymer & Chemical Engineering)", type: "ACADEMIC" },
      { id: "rnd_building", label: "R&D Building (Research & Development)", type: "ACADEMIC" },
      { id: "main_building", label: "Main Building (Admin & IC)", type: "ACADEMIC" },
      { id: "central_library", label: "Central Library Complex", type: "ACADEMIC" },
      { id: "workshop_block", label: "Mechanical / Workshop Block", type: "ACADEMIC" },
      { id: "sac_building", label: "Student Activity Centre (SAC)", type: "ACADEMIC" },
      { id: "main_gate_1", label: "Day Scholar / Main Gate 1", type: "OTHER" },
    ],
  },
  {
    groupName: "Other Places",
    locations: [{ id: "other_place", label: "Other Campus Spot (Specify Details)", type: "OTHER" }],
  },
];

export const GENERIC_COLLEGE_LOCATIONS: CampusLocationGroup[] = [
  {
    groupName: "Hostels & Residences",
    locations: [
      { id: "boys_hostel_generic", label: "Boys Hostel / Hall of Residence", type: "BOYS_HOSTEL" },
      { id: "girls_hostel_generic", label: "Girls Hostel / Hall of Residence", type: "GIRLS_HOSTEL" },
    ],
  },
  {
    groupName: "Campus Buildings",
    locations: [
      { id: "academic_block", label: "Main Academic Building / Departments", type: "ACADEMIC" },
      { id: "central_lib", label: "Central Library / Reading Complex", type: "ACADEMIC" },
      { id: "food_court", label: "Campus Canteen / Food Court Plaza", type: "ACADEMIC" },
      { id: "main_gate", label: "Campus Main Gate / Day Scholar Entry", type: "OTHER" },
    ],
  },
  {
    groupName: "Other Places",
    locations: [{ id: "other_place", label: "Other Campus Spot (Specify Details)", type: "OTHER" }],
  },
];

export function isBitMesraCampus(collegeNameOrSlug?: string): boolean {
  if (!collegeNameOrSlug) return true; // default campus in current phase
  const lower = collegeNameOrSlug.toLowerCase().trim();
  if (lower === "viewer mode" || lower === "your college") return false;
  return (
    lower.includes("bit mesra") ||
    lower.includes("mesra") ||
    lower.includes("birla institute of technology") ||
    lower.includes("inst_35df75700bb23dd30311ef5f")
  );
}

export function getCampusDeliveryLocations(collegeNameOrSlug?: string): CampusLocationGroup[] {
  if (isBitMesraCampus(collegeNameOrSlug)) {
    return BIT_MESRA_LOCATIONS;
  }
  return GENERIC_COLLEGE_LOCATIONS;
}

export const CAMPUS_DELIVERY_LOCATIONS = BIT_MESRA_LOCATIONS;
export const ALL_LOCATION_LABELS = BIT_MESRA_LOCATIONS.flatMap((g) => g.locations.map((l) => l.label));
