export const SITE_NAME = "MorphIndex";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.morphindex.com";

export function siteHostname(url = SITE_URL): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "morphindex.com";
  }
}
