import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSubjects, getSubjectBySlug } from "@/data/registry";
import { SITE_URL } from "@/lib/site";
import { SubjectDetail } from "@/components/subject-detail";

export function generateStaticParams() {
  return getAllSubjects().map((subject) => ({ slug: subject.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const subject = getSubjectBySlug(slug);
  if (!subject) return { title: "Subject not found" };

  return {
    title: subject.name,
    description: `Explore ${subject.name} topics and practice available MCQs on Bujh.`,
    alternates: { canonical: `${SITE_URL}/subjects/${slug}` },
  };
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getSubjectBySlug(slug)) notFound();
  return <SubjectDetail slug={slug} />;
}
