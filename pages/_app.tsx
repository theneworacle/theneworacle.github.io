import '../styles/global.css';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    document.body.classList.add('dark-mode');
  }, []);

  return <Component {...pageProps} />;
}
