import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Ačiū už užklausą",
  description: "Jūsų pamokos užklausa išsiųsta.",
  path: "/aciu",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
