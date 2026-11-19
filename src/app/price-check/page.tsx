import { PageHeader } from "@/components/PageHeader";
import { PriceChecker } from "./PriceChecker";

export const metadata = { title: "Price Check — Deal or Steal" };

export default function PriceCheckPage() {
  return (
    <>
      <PageHeader
        eyebrow="Price check"
        title="Is that listing fairly priced?"
        intro="Enter the details from any listing you've seen on a portal. We'll compare it with recent sales of similar units in the same community."
      />
      <PriceChecker />
    </>
  );
}
