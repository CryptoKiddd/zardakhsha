import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@/styles/globals.scss";

// Self-hosted (OFL-licensed) variable fonts: no build-time network fetch, no layout shift.
const cormorant = localFont({
  src: [
    { path: "../fonts/cormorant-garamond-latin-wght-normal.woff2", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-wght-italic.woff2", style: "italic" },
  ],
  weight: "300 700",
  variable: "--font-cormorant",
  display: "swap",
});

const inter = localFont({
  src: "../fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zardakhsha: Georgian Enamel Atelier",
    template: "%s · Zardakhsha",
  },
  description:
    "Handmade Georgian enamel jewelry with sterling silver and gold detailing: rings, earrings, bracelets and pendants.",
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
