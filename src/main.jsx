import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GlobalSettingsProvider } from './context/GlobalSettingsContext';
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <GlobalSettingsProvider>
            <App />
        </GlobalSettingsProvider>
    </React.StrictMode>
);