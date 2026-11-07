import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Grupinės pamokos",
  description: "Mokykitės mažoje grupėje: grupinės pamokos ruošiantis egzaminams ir kontroliniams. Užsiregistruokite ir mes suburesime grupę.",
  path: "/grupines",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
