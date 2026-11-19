import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Terms of Service — Deal or Steal" };

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="18 November 2026"
      sections={[
        { h: "Acceptance", p: ["By using Deal or Steal you agree to these terms. If you do not agree, please do not use the service."] },
        { h: "The service", p: ["Deal or Steal provides property search, AI assistance and market estimates for Dubai. Features may change, and this prototype may be unavailable at times."] },
        {
          h: "Acceptable use",
          p: [[
            "Do not scrape, overload or attempt to break the service.",
            "Do not submit false booking requests or other people's personal data without permission.",
            "Do not use outputs to mislead buyers, sellers or tenants.",
          ]],
        },
        { h: "No advice", p: ["Content is provided for information only. See our Disclaimer for details on estimates, AI output and our non-broker status."] },
        { h: "Intellectual property", p: ["The Deal or Steal name, design and software belong to the Deal or Steal team. Third-party data remains the property of its owners, including the Dubai Land Department."] },
        { h: "Limitation of liability", p: ["To the extent permitted by law, Deal or Steal is not liable for losses arising from decisions made using the service, including property purchases or rentals."] },
        { h: "Governing law", p: ["These terms are governed by the laws of the Emirate of Dubai and the federal laws of the UAE. Disputes fall under the jurisdiction of the Dubai courts."] },
      ]}
    />
  );
}
