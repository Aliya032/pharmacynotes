import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UploadPage, { uploadMetadata } from "@/components/UploadPage";
import { findUpload, staticParams } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return staticParams("document");
}

export async function generateMetadata({
  params,
}: PageProps<"/documents/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = findUpload("document", slug);
  return item ? uploadMetadata(item) : {};
}

export default async function Page({ params }: PageProps<"/documents/[slug]">) {
  const { slug } = await params;
  const item = findUpload("document", slug);
  if (!item) notFound();
  return <UploadPage item={item} />;
}
