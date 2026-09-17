import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expense Demo",
  description: "ローカルで動作する経費登録・照会デモサイト",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          data-turbolinks-track="reload"
          href="/assets/application-c3df72e94546ce304138fccba3572e705aaeaa8abe0559dba259c0cd8f888814.css"
          media="all"
          rel="stylesheet"
        />
      </head>
      <body data-turbolinks="false">{children}</body>
    </html>
  );
}
