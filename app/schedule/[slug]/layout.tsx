/**
 * Per-subject metadata for /schedule/[slug].
 */

import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { subjectName, subjectOf } from "@/lib/subjects";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = subjectName(decodeURIComponent(slug));
  const of = subjectOf(decodeURIComponent(slug));
  return pageMeta({
    title: `${name} – individualios pamokos`,
    description: `Individualios nuotolinės ${of} pamokos 1–12 klasių mokiniams. Pažymėkite jums tinkamus laikus, o mokytojas susisieks. 25 € už 45 min.`,
    path: `/schedule/${slug}`,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
