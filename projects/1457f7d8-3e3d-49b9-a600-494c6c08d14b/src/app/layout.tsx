import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next-google-fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Rustic Table | Authentically Sourced, Heartfully Served",
  description: "Experience the finest farm-to-table cuisine in a warm, rustic atmosphere. Join us for an unforgettable dining experience.",
  keywords: "restaurant, fine dining, rustic, farm to table, reservations, menu, food",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Lato:wght@300;400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
