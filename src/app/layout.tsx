import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { FB_PIXEL_ID } from "@/lib/fpixel";

const siteDomain = "https://meemstonex.com";
const ogImageUrl = `/meemstonex/thumbnail.webp`;

export const metadata: Metadata = {
  metadataBase: new URL(siteDomain),
  title: "Meemstonex | Custom Marble Mandirs & Luxury Sacred Spaces",
  description:
    "Turnkey custom marble mandirs designed for your home — Starting from ₹1 Lakh with 28+ years & 3rd generation stone craftsmanship.",
  keywords:
    "custom marble mandir, pooja room design, makrana marble mandir, vietnam marble mandir, temple architecture, sacred spaces",
  openGraph: {
    title: "Meemstonex | Custom Marble Mandirs & Luxury Sacred Spaces",
    description:
      "Turnkey custom marble mandirs designed for your home — Starting from ₹1 Lakh with 28+ years & 3rd generation stone craftsmanship.",
    url: siteDomain,
    siteName: "Meemstonex",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Meemstonex | Custom Marble Mandirs & Luxury Sacred Spaces",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meemstonex | Custom Marble Mandirs & Luxury Sacred Spaces",
    description:
      "Turnkey custom marble mandirs designed for your home — Starting from ₹1 Lakh with 28+ years & 3rd generation stone craftsmanship.",
    images: [ogImageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth h-full antialiased">
      <head>
        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteDomain} />
        <meta property="og:site_name" content="Meemstonex" />
        <meta
          property="og:title"
          content="Meemstonex | Custom Marble Mandirs & Luxury Sacred Spaces"
        />
        <meta
          property="og:description"
          content="Turnkey custom marble mandirs designed for your home — Starting from ₹1 Lakh with 28+ years & 3rd generation stone craftsmanship."
        />
        <meta property="og:image" content={ogImageUrl} />

        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Noto+Serif+Devanagari:wght@400;600;700&display=swap"
          rel="stylesheet"
        />

        {/* FontAwesome Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="w-full min-h-full bg-[#FAF7F0] text-[#1E1C17] font-sans selection:bg-[#B8860B] selection:text-white">
        {children}

        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
