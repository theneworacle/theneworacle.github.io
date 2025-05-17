import '../styles/global.css';
import { ConfigProvider, theme } from 'antd';

export default function App({ Component, pageProps }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
