import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
export const metadata = { title: "Discord Dashboard", description: "Professional Discord bot dashboard" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={inter.className + " min-h-screen bg-background"}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
