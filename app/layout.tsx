import "./globals.css";
import localFont from "next/font/local";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";

const stormFont = localFont({
  src: "../public/storm.ttf",
  variable: "--font-storm",
  display: "swap",
  preload: true,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={stormFont.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="screen-orientation" content="portrait" />
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('screen' in window && 'orientation' in screen && screen.orientation && 'lock' in screen.orientation) {
                screen.orientation.lock('portrait').catch(function () {});
              }
            `,
          }}
        />
      </head>
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
