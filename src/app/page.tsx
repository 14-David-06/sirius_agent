'use client';

import dynamic from 'next/dynamic';
import PartnerCarousel from '../components/PartnerCarousel';

// Importar dinámicamente el componente para evitar problemas de SSR con Three.js
const ThreeAnimation = dynamic(() => import('../components/ThreeAnimationFixed'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
});

export default function Home() {
  return (
    <div className="w-full h-screen overflow-hidden relative">
      <ThreeAnimation />
      <PartnerCarousel />
    </div>
  );
}
