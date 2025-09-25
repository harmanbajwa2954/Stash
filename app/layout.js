import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Stash - Your Financial Partner",
  description: "Ready to reach your financial goals? Stash is the easy-to-use expense tracker that helps you save money with confidence. See where your money goes and start growing your stash today!",
};
export const runtime = "nodejs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />

          <footer className="bg-blue-50 py-8">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Copyright 2025&copy; Stash - All Rights Reserved.</p>
              <p className="text-xs text-muted-foreground">Developed by Harmanpreet Singh</p>
            </div>
            <div className="container mx-auto px-4 text-center text-muted-foreground mt-4">
              <span>Contact Me: </span>
              <a className="text-blue-400 mx-2" href="mailto:harmanbajwa012005@gmail.com">Email</a>
              <a className="text-blue-400 mx-2" href="https://github.com/harmanbajwa2954" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a className="text-blue-400 mx-2" href="https://linkedin.com/in/harmanpreet-singh-804746273" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
