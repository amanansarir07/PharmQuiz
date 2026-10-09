import { notFound } from "next/navigation";
import { getAllSubjects, getSubjectBySlug } from "@/data/registry";
import { SubjectDetail } from "@/components/subject-detail";
export function generateStaticParams() { return getAllSubjects().map((subject) => ({ slug: subject.slug })); }
export default async function SubjectPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; if (!getSubjectBySlug(slug)) notFound(); return <SubjectDetail slug={slug} />; }
