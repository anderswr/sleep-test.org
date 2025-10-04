// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sleep-test.org";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/static/"], // ikke relevant for SEO
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE, // hint om hoveddomene
  };
}
