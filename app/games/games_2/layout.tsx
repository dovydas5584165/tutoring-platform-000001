/**
 * Route layout: SEO metadata for this page.
 */

import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Night Run žaidimas",
  description: "Lenktynių žaidimas naktiniame miške: nuvežkite gaisrininką, greitosios pagalbos medikę ar policininkę iki įvykio vietos laiku.",
  path: "/games/games_2",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
