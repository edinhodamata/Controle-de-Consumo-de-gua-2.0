import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './services/serviceWorkerRegistration';

createRoot(document.getElementById('root')!).render(<App />);

// Registra o Service Worker para cache offline e disponibilidade contínua
registerServiceWorker();
