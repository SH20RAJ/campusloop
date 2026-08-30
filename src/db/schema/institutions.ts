import { index, integer, jsonb, pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";

export const institutionDomainTypeEnum = pgEnum("institution_domain_type", [
  "WEBSITE",
  "EMAIL",
  "STUDENT_EMAIL",
  "UNKNOWN",
]);

export const domainVerificationStatusEnum = pgEnum("domain_verification_status", [
  "UNVERIFIED",
  "AUTO_IMPORTED",
  "STUDENT_VERIFIED",
  "ADMIN_VERIFIED",
  "REJECTED",
]);

export const institutionRequestStatusEnum = pgEnum("institution_request_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const institutions = pgTable(
  "institutions",
  {
    id: id(),
    aisheCode: text("aishe_code").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    state: text("state"),
    district: text("district"),
    website: text("website"),
    websiteDomain: text("website_domain"),
    yearOfEstablishment: integer("year_of_establishment"),
    locationType: text("location_type"),
    logoUrl: text("logo_url"),
    bannerUrl: text("banner_url"),
    nirfRank: integer("nirf_rank"),
    description: text("description"),
    extraData: jsonb("extra_data").$type<{
      wikipediaUrl?: string;
      summary?: string;
      campusAcreage?: string;
      affiliation?: string;
      chancellor?: string;
      viceChancellor?: string;
      phone?: string;
      naacGrade?: string;
    }>(),
    country: text("country").default("India").notNull(),
    source: text("source").default("colleges_csv").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("institutions_aishe_code_idx").on(table.aisheCode),
    uniqueIndex("institutions_slug_idx").on(table.slug),
    index("institutions_search_idx").on(table.name, table.state, table.district, table.websiteDomain),
  ]
);

export const institutionDomains = pgTable(
  "institution_domains",
  {
    id: id(),
    institutionId: text("institution_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    domainType: institutionDomainTypeEnum("domain_type").default("UNKNOWN").notNull(),
    verificationStatus: domainVerificationStatusEnum("verification_status").default("UNVERIFIED").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("institution_domains_domain_idx").on(table.domain),
    uniqueIndex("institution_domains_institution_domain_idx").on(table.institutionId, table.domain),
  ]
);

export const institutionRequests = pgTable(
  "institution_requests",
  {
    id: id(),
    userId: text("user_id").notNull(),
    emailDomain: text("email_domain"),
    suggestedInstitutionName: text("suggested_institution_name").notNull(),
    state: text("state"),
    district: text("district"),
    status: institutionRequestStatusEnum("status").default("PENDING").notNull(),
    createdAt,
  },
  (table) => [index("institution_requests_status_created_idx").on(table.status, table.createdAt)]
);

export type Institution = typeof institutions.$inferSelect;
export type NewInstitution = typeof institutions.$inferInsert;
