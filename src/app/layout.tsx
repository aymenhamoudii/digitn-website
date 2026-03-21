import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { siteConfig } from '@/config/site'
import Script from 'next/script'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '800'],
  display: 'swap',
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'DIGITN (Digi TN) | Agence Web Tunisie - Création Sites & E-commerce',
    template: '%s | DIGITN',
  },
  description: 'DIGITN (Digi TN) - Agence web tunisienne spécialisée dans la création de sites performants, e-commerce et solutions digitales. +50 projets livrés, 98% satisfaction. Devis gratuit sous 24h.',
  keywords: [
    'digitn',
    'digi tn',
    'digi-tn',
    'agence web tunisie',
    'agence web tunis',
    'création site web tunisie',
    'développement web tunisie',
    'e-commerce tunisie',
    'site vitrine tunisie',
    'agence digitale tunis',
    'création site internet tunisie',
    'développeur web tunisie',
    'design web tunisie',
    'SEO tunisie',
    'agence digitale tunisie',
    'web agency tunisia',
    'site web professionnel tunisie',
    'boutique en ligne tunisie',
  ],
  authors: [{ name: 'DIGITN' }],
  creator: 'DIGITN',
  publisher: 'DIGITN',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_TN',
    url: siteConfig.url,
    title: 'DIGITN (Digi TN) | Agence Web Tunisie - Création Sites & E-commerce',
    description: 'DIGITN (Digi TN) - Agence web tunisienne spécialisée dans la création de sites performants, e-commerce et solutions digitales. +50 projets livrés, 98% satisfaction.',
    siteName: siteConfig.name,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DIGITN (Digi TN) - Agence Web Tunisie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DIGITN | Agence Web en Tunisie',
    description: 'Création de sites web professionnels et e-commerce en Tunisie. Devis gratuit sous 24h.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '', // Add your Google Search Console verification code
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const isRTL = locale === 'ar'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteConfig.url}/#organization`,
    name: 'DIGITN',
    alternateName: ['Digi TN', 'Digi-TN'],
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    image: `${siteConfig.url}/og-image.jpg`,
    priceRange: '$$',
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tunis',
      addressRegion: 'Tunis',
      addressCountry: 'TN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 36.8065,
      longitude: 10.1815,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Tunisia',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.phone,
      contactType: 'customer service',
      areaServed: 'TN',
      availableLanguage: ['French', 'Arabic'],
      contactOption: 'TollFree',
    },
    sameAs: [
      siteConfig.social.facebook,
      siteConfig.social.instagram,
      siteConfig.social.linkedin,
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '50',
    },
  }

  return (
    <html
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('digitn-theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {siteConfig.analytics.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.analytics.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${siteConfig.analytics.googleAnalyticsId}');
              `}
            </Script>
          </>
        )}
        {siteConfig.analytics.metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${siteConfig.analytics.metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position="bottom-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
