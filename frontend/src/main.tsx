import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="519535575528-pccstck0voe5n0sc3nt5dvo0l060tesi.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
