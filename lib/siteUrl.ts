/** Open Graph 등 절대 URL 생성용 */
export function getMetadataBase(): URL {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const path = basePath ? (basePath.startsWith("/") ? basePath : `/${basePath}`) : "";
  return new URL(`${siteUrl}${path}/`);
}
