import "normalize.css";
import "./globals.css";
import Header from "@/app/Header";
import Footer from "@/app/Footer";
import Main from "@/app/Main";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />

        <Main>{children}</Main>

        <Footer />
      </body>
    </html>
  );
}
