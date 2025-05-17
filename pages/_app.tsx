import '../styles/global.css';
import { useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    document.body.classList.add('dark-mode');
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: '#1e1e1e', // Set base background color for dark mode
        },
      }}
    >
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
