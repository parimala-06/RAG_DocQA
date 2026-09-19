import { Bricolage_Grotesque, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

export const metadata = {
  title: "Archive — Document Q&A",
  description: "Upload a document, ask questions, get cited answers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${plexSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
