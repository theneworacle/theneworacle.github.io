import './polyfills'; // Import the polyfills
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import App from './App';
import '../styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorBgBase: '#1e1e1e', // Set base background color for dark mode
          },
        }}
      >
        <App />
      </ConfigProvider>
    </Router>
  </React.StrictMode>,
);
