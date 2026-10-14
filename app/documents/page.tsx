import type { Metadata } from "next";
import ListingPage from "@/components/ListingPage";

export const metadata: Metadata = {
  title: "Documents",
  description:
    "Documents for B.Pharm and Pharm.D students, free to read online and download.",
  alternates: { canonical: "/documents" },
};

export default function Page() {
  return <ListingPage category="document" />;
}
