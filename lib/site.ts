import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.tiksliukai.lt").replace(/\/$/, "");
export const SITE_NAME = "Tiksliukai.lt";
export const CONTACT_EMAIL = "info.tiksliukai@gmail.com";


/** Title, description, canonical URL and share preview for one page. */
const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Tiksliukai.lt – korepetitoriai, kurie visada padės" };

export function pageMeta({ title, description, path, noindex = false }: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "lt_LT", siteName: SITE_NAME, url: path, title: `${title} | ${SITE_NAME}`, description, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description, images: [OG_IMAGE.url] },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

/** For private pages (dashboards, payment, auth helpers): keep them out of search results. */
export const PRIVATE_PAGE: Metadata = { robots: { index: false, follow: false } };

/**
 * Who legally provides the services (required by the Lithuanian Law on Information Society Services
 * and consumer law). `code` is optional: add the individual activity certificate number here if needed.
 */
export const SELLER = {
  name: "Dovydas Žilinskas",
  legalForm: "individuali veikla",
  code: "", // individualios veiklos pažymos nr. (neprivaloma rodyti čia)
  vatCode: "", // PVM mokėtojo kodas, jei esate PVM mokėtojas
  address: "Saulėtekio al. 4, Vilnius",
  email: CONTACT_EMAIL,
};
