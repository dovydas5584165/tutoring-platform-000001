/**
 * Route layout: SEO metadata for the schools e-diary demo page.
 */

import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "El. dienynas mokykloms su nemokama analitika",
  description:
    "Modernus elektroninis dienynas: pažymiai, lankomumas, namų darbai ir nemokama analitika mokytojams, administracijai ir tėvams. Išbandykite demo ir užsakykite demonstraciją.",
  path: "/dienynas",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
