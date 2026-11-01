import type { AppProps } from 'next/app';
import Script from 'next/script';
import '../styles/global.css';
import 'antd/dist/reset.css'; // Import Ant Design styles

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-CEX42L2CNV"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CEX42L2CNV');
        `}
      </Script>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
