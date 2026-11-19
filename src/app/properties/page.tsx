import { PageHeader } from "@/components/PageHeader";
import { PropertyBrowser } from "./PropertyBrowser";

export const metadata = { title: "Properties — Deal or Steal" };

export default function PropertiesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Properties"
        title="Dubai homes, with honest prices"
        intro="Every listing is compared against recent Dubai Land Department sales of similar units. Green means below market, gold is fair, red means you should negotiate."
      />
      <PropertyBrowser />
    </>
  );
}
