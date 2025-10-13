import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { HelmetProvider } from 'react-helmet-async';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';
import store from './store/store';
import theme from './theme';
import './i18n'; // Initialize i18n
import './index.css';
import './banner-override.css';

// Import code protection in production
if (process.env.NODE_ENV === 'production') {
  import('./utils/protectCode.js');
}

console.log('Application is starting...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Failed to find the root element');
} else {
  console.log('Root element found, rendering application...');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <LanguageProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <BrowserRouter>
                <HelmetProvider>
                  <App />
                </HelmetProvider>
              </BrowserRouter>
            </ThemeProvider>
          </LanguageProvider>
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
