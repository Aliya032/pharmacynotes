import type { Metadata } from "next";
import ListingPage from "@/components/ListingPage";

export const metadata: Metadata = {
  title: "Presentations",
  description:
    "Presentations for B.Pharm and Pharm.D students, free to read online and download.",
  alternates: { canonical: "/presentations" },
};

export default function Page() {
  return <ListingPage category="presentation" />;
}
