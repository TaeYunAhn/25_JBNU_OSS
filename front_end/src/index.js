import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// 개발 환경에서만 MSW를 활성화합니다.
// 현재 MSW 모킹을 완전히 비활성화 (실제 백엔드 API 사용)
// if (process.env.NODE_ENV === 'development') {
//   import('./mocks/browser').then(({ worker }) => {
//     worker.start({
//       onUnhandledRequest: 'bypass',
//     });
//   });
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
