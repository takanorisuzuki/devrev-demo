import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navigation from "@/components/layouts/Navigation";
import { ErrorProvider } from "@/lib/contexts/error-context";
import { ToastProvider } from "@/components/ui/toast";
import { PlugSDKProvider } from "@/components/devrev/plug-sdk-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "DriveRev - あなたの理想のドライブを",
  description:
    "日本全国の高品質なレンタカーを、いつでもどこでも簡単予約。DriveRevで快適なドライブ体験を。",
  keywords: "レンタカー, ドライブ, 日本, 予約, DriveRev, 車両レンタル",
  authors: [{ name: "DriveRev Team" }],
  openGraph: {
    title: "DriveRev - あなたの理想のドライブを",
    description: "日本全国の高品質なレンタカーを、いつでもどこでも簡単予約",
    url: "https://driverev.jp",
    siteName: "DriveRev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DriveRev - あなたの理想のドライブを",
    description: "日本全国の高品質なレンタカーを、いつでもどこでも簡単予約",
  },
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // PLuG SDK URL（環境変数から取得、デフォルトは本番URL）
  const plugSDKUrl =
    process.env.NEXT_PUBLIC_DEVREV_PLUG_SDK_URL ||
    "https://plug-platform.devrev.ai/static/plug-sdk.js";

  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className="font-sans antialiased">
        {/* DevRev PLuG SDK Script */}
        <Script
          src={plugSDKUrl}
          strategy="afterInteractive"
          onLoad={() => {
            console.log("✅ PLuG SDK script loaded");
          }}
          onError={(e) => {
            console.error("❌ Failed to load PLuG SDK script:", e);
          }}
        />

        <ErrorProvider>
          <ToastProvider>
            {/* PLuG SDK Provider - 認証済みユーザー向けにPLuGを初期化 */}
            <PlugSDKProvider />

            <div id="root" className="min-h-screen bg-background">
              <Navigation />
              {children}
            </div>
          </ToastProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
