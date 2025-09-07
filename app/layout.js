import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Stash - Your Financial Partner",
  description: "Ready to reach your financial goals? Stash is the easy-to-use expense tracker that helps you save money with confidence. See where your money goes and start growing your stash today!",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made with ❤️ by Harman Bajwa</p></div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
