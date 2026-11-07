import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tiksliukai.lt – korepetitoriai",
    short_name: "Tiksliukai",
    description: "Individualios nuotolinės pamokos 1–12 klasių mokiniams.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3B65CE",
    lang: "lt",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
