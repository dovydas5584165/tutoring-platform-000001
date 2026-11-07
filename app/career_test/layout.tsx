import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Karjeros testas",
  description: "Karjeros testas moksleiviams: sužinokite, kokios studijų kryptys ir egzaminai jums tinka, ir gaukite eksperto konsultaciją.",
  path: "/career_test",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
