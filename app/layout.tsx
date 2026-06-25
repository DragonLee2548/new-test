import type { Metadata, Viewport } from "next";
import { getMetadataBase } from "@/lib/siteUrl";
import "./globals.css";

const title = "먼작귀 파티";
const description = "우사기·치이카와·하치와레와 함께 두더지 잡기, 미로 탈출, 가위바위보 미니게임!";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title,
  description,
  openGraph: {
    title,
    description,
    locale: "ko_KR",
    type: "website",
    siteName: title,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
