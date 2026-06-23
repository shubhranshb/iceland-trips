import "./globals.css";

export const metadata = {
  title: "Iceland Trip Planner",
  description: "Dec 9–13, 2025 — Hotel 201, South Coast, Golden Circle & Reykjavík",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
