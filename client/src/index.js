// client/src/index.js
import 'react-app-polyfill/stable';
import 'react-app-polyfill/ie11';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// New React 18 way of rendering
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Old React 17 way (this is causing your error)
// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );