import { NextResponse } from "next/server";

export const GET = () => {
  const sitemap = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tiksliukai.lt/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tiksliukai.lt/pamokos</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://tiksliukai.lt/korepetitoriai</loc>
    <priority>0.8</priority>
  </url>
</urlset>
  `.trim();

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
