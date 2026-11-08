/**
 * robots.txt: keeps private pages and the API out of search engines.
 */

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Served as /robots.txt. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/", "/tutor_dashboard", "/student_dashboard", "/admin_dashboard",
        "/payment", "/payment-success", "/test", "/test-start", "/aciu",
        "/atnaujinti_slaptazodi", "/auth/forgot_pass",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
