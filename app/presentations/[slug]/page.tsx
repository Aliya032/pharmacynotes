import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UploadPage, { uploadMetadata } from "@/components/UploadPage";
import { findUpload, staticParams } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return staticParams("presentation");
}

export async function generateMetadata({
  params,
}: PageProps<"/presentations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = findUpload("presentation", slug);
  return item ? uploadMetadata(item) : {};
}

export default async function Page({
  params,
}: PageProps<"/presentations/[slug]">) {
  const { slug } = await params;
  const item = findUpload("presentation", slug);
  if (!item) notFound();
  return <UploadPage item={item} />;
}
