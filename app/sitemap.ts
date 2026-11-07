import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { SUBJECTS } from "@/lib/subjects";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") =>
    ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority });

  return [
    page("/", 1, "weekly"),
    ...SUBJECTS.map((s) => page(`/schedule/${s.slug}`, 0.9, "weekly")),
    page("/grupines", 0.7),
    page("/career_test", 0.7),
    page("/akciju_birza", 0.4),
    page("/games/games_2", 0.3),
    page("/privatumo-politika", 0.2, "yearly"),
    page("/taisykles", 0.2, "yearly"),
  ];
}
