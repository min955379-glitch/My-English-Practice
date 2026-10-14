import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!site) return [];
  return [
    "/",
    "/phonics",
    "/reading",
    "/pronunciation",
    "/help",
    "/privacy",
    "/terms",
    "/about",
    "/contact",
  ].map((path) => ({
    url: new URL(path, site).href,
    changeFrequency: "monthly" as const,
  }));
}
