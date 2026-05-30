import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "LSA",
    description: SITE_TAGLINE,
    start_url: "/",
    display: "standalone",
    background_color: "#0B0E14",
    theme_color: "#7c3aed",
    lang: "es",
    icons: [
      {
        src: "/logo-lsa.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
