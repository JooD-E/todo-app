import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './shared/styles/reset.css'
import './shared/styles/app.css'
import App from './app/App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
