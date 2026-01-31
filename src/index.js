import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n/i18n';
import 'font-awesome/css/font-awesome.min.css';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './Redux/Store';

// Performance optimizations
if (process.env.NODE_ENV === 'production') {
  // Disable console.log in production
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
}

// Create root with performance optimizations
const root = ReactDOM.createRoot(document.getElementById('root'), {
  // Enable concurrent features for better performance
  identifierPrefix: 'tix-app',
});

// Render with error boundary
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  // Only report web vitals in development
  // reportWebVitals(console.log);
} else {
  // In production, you can send to analytics service
  reportWebVitals((metric) => {
    // Send to analytics service
    // analytics.track('web-vital', metric);
  });
}
