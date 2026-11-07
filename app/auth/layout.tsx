import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Prisijungimas ir registracija",
  description: "Prisijunkite arba užsiregistruokite Tiksliukai.lt ir stebėkite mokinio progresą.",
  path: "/auth",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
