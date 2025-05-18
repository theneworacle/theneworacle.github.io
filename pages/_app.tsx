import type { AppProps } from 'next/app';
import '../styles/global.css';
import 'antd/dist/reset.css'; // Import Ant Design styles

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
