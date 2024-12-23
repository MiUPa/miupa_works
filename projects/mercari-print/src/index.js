// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // ここでindex.cssをインポート
import App from './App';
import reportWebVitals from './reportWebVitals'; // ここでreportWebVitalsをインポート

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals(); // パフォーマンス測定を実行