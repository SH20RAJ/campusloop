"use client";

import {
DocLayout,
DocSection,
DocTable,
LegalDocHeader,
type DocSectionRef,
} from "@/components/marketing/legal-doc";
import { LegalNav } from "@/components/marketing/legal-nav";
import { MarketingFooter,MarketingHeader } from "@/components/marketing/system";
import Link from "next/link";

const SECTIONS: DocSectionRef[] = [
  { id: "desks", label: "Where to write" },
  { id: "urgent", label: "Something urgent" },
  { id: "college", label: "Add your college" },
  { id: "statutory", label: "Statutory contacts" },
];

function MailLink({ address }: { address: string }) {
  return (
    <a
      href={`mailto:${address}`}
      className="font-mono text-[14px] text-primary underline-offset-4 hover:underline"
    >
      {address}
    </a>
  );
}

export function ContactClient() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <MarketingHeader />
      <LegalNav />

      <main className="flex-1 pt-14">
        <DocLayout sections={SECTIONS}>
          <LegalDocHeader
            eyebrow="Support"
            title="Contact us"
            summary="A real person reads every one of these. Pick the desk that matches what you need — it reaches the right people faster than a general enquiry."
            meta={["Response within 24–48 hours", "English and Hindi", "CampusLoop Inc."]}
          />

          <DocSection id="desks" number={1} title="Where to write">
            <DocTable
              rows={[
                {
                  label: "General support",
                  value: <MailLink address="support@campusloop.space" />,
                  note: "Account access, verification trouble, bugs, anything that isn't covered below.",
                },
                {
                  label: "Safety and harassment",
                  value: <MailLink address="safety@campusloop.space" />,
                  note: "Ragging, threats, doxxing, or a student in distress. Escalated ahead of the queue.",
                },
                {
                  label: "Privacy and data",
                  value: <MailLink address="privacy@campusloop.space" />,
                  note: "Data access, correction, or deletion requests under the DPDP Act, 2023.",
                },
                {
                  label: "College partnerships",
                  value: <MailLink address="partners@campusloop.space" />,
                  note: "Onboarding an institution, verifying a domain, or campus ambassador programmes.",
                },
                {
                  label: "Press",
                  value: <MailLink address="press@campusloop.space" />,
                  note: "Media enquiries and brand assets.",
                },
              ]}
            />
          </DocSection>

          <DocSection id="urgent" number={2} title="Something urgent">
            <p>
              If a student is in immediate danger, contact emergency services before you contact us.
              The national helplines are listed on the{" "}
              <Link href="/safety" className="text-primary underline-offset-4 hover:underline">
                safety page
              </Link>
              , and they are free and staffed around the clock.
            </p>
            <p>
              To report a specific post or account, use the report control on the post itself — that
              routes into the moderation queue with the context already attached, which is faster
              than describing it over email.
            </p>
          </DocSection>

          <DocSection id="college" number={3} title="Add your college">
            <p>
              If your institution&apos;s email domain is not recognised during sign-up, you can
              request it directly from the{" "}
              <Link href="/colleges" className="text-primary underline-offset-4 hover:underline">
                college directory
              </Link>{" "}
              — that form goes straight into the verification queue. Write to the partnerships desk
              if your college wants an official hub with administrator access.
            </p>
          </DocSection>

          <DocSection id="statutory" number={4} title="Statutory contacts">
            <p>
              Published under Rule 3(2) of the IT (Intermediary Guidelines and Digital Media Ethics
              Code) Rules, 2021 and the DPDP Act, 2023.
            </p>
            <DocTable
              rows={[
                {
                  label: "Grievance Officer",
                  value: <MailLink address="grievance@campusloop.space" />,
                  note: "Acknowledgement within 24 hours, resolution within 15 days.",
                },
                {
                  label: "Data Protection Officer",
                  value: <MailLink address="privacy@campusloop.space" />,
                  note: "Response within 24–48 working hours.",
                },
                { label: "Entity", value: "CampusLoop Inc.", note: "Registered in India." },
              ]}
            />
          </DocSection>
        </DocLayout>
      </main>

      <MarketingFooter />
    </div>
  );
}
