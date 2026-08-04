import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.morphindex.com";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app/", "/onboarding/", "/api/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
