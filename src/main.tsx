import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import App from './App.tsx';
import { PortfolioProvider } from './context/PortfolioContext.tsx';
import './index.css';

// Ensure gsap and ScrollTrigger are globally accessible in all contexts
if (typeof window !== 'undefined') {
  (window as any).gsap = (window as any).gsap || gsap;
  (window as any).ScrollTrigger = (window as any).ScrollTrigger || ScrollTrigger;
  try {
    const activeGsap = (window as any).gsap;
    const activeScrollTrigger = (window as any).ScrollTrigger;
    if (activeGsap?.registerPlugin && activeScrollTrigger) {
      activeGsap.registerPlugin(activeScrollTrigger);
    }
  } catch (err) {
    console.warn('ScrollTrigger registration:', err);
  }
}


import { AuthProvider } from './context/AuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <PortfolioProvider>
      <App />
    </PortfolioProvider>
  </AuthProvider>
);
