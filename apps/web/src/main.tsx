import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { z } from 'zod';
import App from './App';
import i18n from './i18n';
import './api/auth';
import './index.css';
import './lib/theme/contrastGuard';
import zodErrorMap from './lib/zodErrorMap';

z.setErrorMap(zodErrorMap);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>,
);
