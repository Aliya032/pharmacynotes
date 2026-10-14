import type { Metadata } from "next";
import ListingPage from "@/components/ListingPage";

export const metadata: Metadata = {
  title: "Infographics",
  description:
    "Infographics for B.Pharm and Pharm.D students, free to read online and download.",
  alternates: { canonical: "/infographics" },
};

export default function Page() {
  return <ListingPage category="infographic" />;
}
