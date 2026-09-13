import "./globals.css";

export const metadata = {
  title: "Archive — Document Q&A",
  description: "Upload a document, ask questions, get cited answers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
