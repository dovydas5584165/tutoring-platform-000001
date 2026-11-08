/**
 * Route layout: SEO metadata for this page.
 */

import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Akcijų biržos žaidimas",
  description: "Mokomasis žaidimas apie sudėtines palūkanas, žvakių grafikus ir finansų krizes. Investuokite virtualius pinigus ir stebėkite, kas vyksta.",
  path: "/akciju_birza",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
